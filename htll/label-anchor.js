import Label from './label.js'
import NOLLinePos from './nol-linepos.js'
import {parseKey} from '../utils/index.js'
import UniqueID from './uid.js'
import HREFs from './hrefs.js'

class LabelAnchor extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.pat=/^a$/i
        this.del=true;
        this.namespace={};
        this.header={};
        this.hrefs=new HREFs();
        this.idPatterns=[];
    }
    namespaceObject(context){
        if (!this.namespace[context.namespace]) {
            this.namespace[context.namespace]={
                '_':new UniqueID({namespace:context.namespace}),
                '.':new NOLLinePos({namespace:context.namespace})
            };
            context.numberings=context.htll.numbering.split(',').map(pat=>{
                return [pat,new RegExp('^'+pat.replace(/(\d+)/,(m,m1)=>{
                    const depth=parseInt(m1);
                    if (depth==0) return m;
                    return '\\d+' + "(\\.\\d+)?".repeat(depth-1);
                }))];
            })
        }
        return this.namespace[context.namespace]
    }
    addAnchor(tag,context,aname,nline) {
        const ns=this.namespaceObject(context);
        if (tag.offset!==0) throw "<a name> must be at the beginning, line:"+nline
        const key=parseKey(aname) ;
        if (key) {
            const r=ns['.'].push(key,nline);
            if (!r) throw "error key order "+aname+" at "+nline;
        } else {
            for (let i=0;i<context.numberings.length;i++) {
                const [fname,pat]=context.numberings[i];
                const m=aname.match(pat);
                if (m&& m[0]==aname) {
                    const keystr=aname.replace(/[^\d\.]/g,'');
                    const key=parseKey(keystr);
                    if (key) {
                        if (!ns[fname]) ns[fname]=new NOLLinePos({namespace:context.namespace})
                        ns[fname].push(key,nline);
                    } else {
                        throw "invalid a-name "+aname+ 'pattern '+fname;
                    }
                    return;
                }
            }
            //當作一般情況，按key排序，nline arr 亂序，無法delta 壓縮
            ns._.push(aname,nline); 
        }
    }
    addHref(tag,href,nline,text){
        if (!href) return;
        let target=href.substr(1);
        if (!target) return;
        if (href[0]!='#') {
            const url=new URL(href,'http://localhost');
            target=decodeURI(url.hash.substr(1));
        }
        let innertext=text.substr(tag.rawoffset+tag.len).replace(/<\/a>.*/,'');
        this.hrefs.push([ nline, tag.offset,innertext.length, target ]);
    }
    action( {tag ,nline,text,context }){
        if (tag.closing) return;
        const {name,href}=tag.attrs;
        
        name?this.addAnchor(tag,context,name,nline,text):this.addHref(tag,href,nline,text);
    }
    parse(str){
        console.log(str)
    }
    serialize(){
        let out=[];
        this.header.features={};
        for (let ns in this.namespace) {            
            const feature={};
            const NS=this.namespace[ns];
            for (let name in NS) {
                if (NS[name].pushCount()){
                    out=out.concat(NS[name].serialize());
                    feature[name]=true;
                }
                this.header.features[ns]=feature;
            }
        }
        out=out.concat(this.hrefs.serialize());
        out.unshift(JSON.stringify(this.header));
        return out;
    }
    deserialize(payload){
        this.header=JSON.parse(payload.shift());
        if (this.header.features) for (let ns in this.header.features){
            const feature=this.header.features[ns];
            const obj={};
            for (let name in feature) {
                if (name=='_') {
                    obj._=new UniqueID({ns,name:feature.name});
                    obj._.deserialize( payload );
                } else {
                    obj[name]=new NOLLinePos({ns});
                    obj[name].deserialize(payload)
                }
            }
            this.namespace[ns]=obj;
        };
        this.hrefs=new HREFs();
        this.hrefs.deserialize(payload)
    }
}
export default LabelAnchor ;