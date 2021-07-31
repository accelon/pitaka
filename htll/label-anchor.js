import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta,bsearch,parseArg} from'../utils/index.js';
import UniqueID from './uid.js';
class LabelAnchor extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.pat=/^a$/i
        this.del=true;
        this.scopeuid={};
        this.header={};
        this.hrefs=[];
    }
    action( {tag ,nline,text}){
        if (tag.closing) return;
        const {name,href}=tag.attrs;
        if (!this.scope) this.scope='*';//global scope
        if (!this.scopeuid[this.scope]) {
            this.scopeuid[this.scope]=new UniqueID({scope:this.scope});
        }
        const Uid=this.scopeuid[this.scope];

        if (name) { //a name
            if (tag.offset!==0) throw "<a name> must be at the beginning, line:"+nline
            Uid&&Uid.push( name ,nline);    
        } else if (href) {  //a href
            let target=href.substr(1);
            if (href[0]!='#') {
                const url=new URL(href,'http://localhost');
                console.log(tag,url.searchParams)
                target=decodeURI(url.hash.substr(1));
            }
           
            let innertext=text.substr(tag.rawoffset+tag.len).replace(/<\/a>.*/,'');
            this.hrefs.push([ nline, tag.offset,innertext.length, target ]);
        }
    }
    parse(str){
        console.log(str)
    }
    serialize(){
        const serialize_href=hrefs=>{
            const nlines=[], offsets=[], lengths=[],targets=[];
            hrefs.forEach(item=>{
                const [nline,offset,length,target]=item;
                nlines.push(nline);
                offsets.push(offset);
                lengths.push(length);
                targets.push(target);
            })
            return [ pack_delta(nlines),pack(offsets),pack(lengths),targets.join('\t') ];
        }
        let out=[];
        for (let scope in this.scopeuid) {
            this.header.scope={};
            const out2=this.scopeuid[scope].serialize();
            this.header.scope[scope]=this.scopeuid[scope].name;
            out=out.concat(out2);
        }
        out=out.concat(serialize_href(this.hrefs));

        out.unshift(JSON.stringify(this.header));
        return out;
    }
    deserialize(payload){
        this.header=JSON.parse(payload.shift());

        if (this.header.scope) for (let scope in this.header.scope){
            const uid=new UniqueID({scope,name:this.header.scope[scope]});
            uid.deserialize( payload );
            this.scopeuid[scope]=uid;
        };
        const nlines=unpack_delta(payload.shift());
        const offsets=unpack(payload.shift());
        const lengths=unpack(payload.shift());
        const targets=payload.shift().split(/\t/);
        this.hrefs={nlines,offsets,lengths,targets};
        console.log(this.hrefs)
    }
}

export default LabelAnchor ;