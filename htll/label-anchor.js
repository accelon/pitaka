import Label from './label.js'      //root class
import {NOLLinePos ,regExpFromAName} from './nol-linepos.js' //數字型錨點
import UniqueID from './uid.js'    //文字型錨點
import HREFs from './hrefs.js'     //超連結目標
import {addHref,addAName} from './anchor-handler.js'; //分別處理 <a href> , <a name>

import {parseAddress} from './address.js';
class LabelAnchor extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.pat=/^a$/     //標籤樣式 限小寫
        this.del=true;     //從htm移除
        this.namespace={}; //名域
        this.header={aname:{},// aname 錨點定義
          nsnline:{}//namespace 起點
          };   
        this.hrefs=new HREFs();
    }
    namespaceObject(context,nline){
        if (!this.namespace[context.namespace]) {
            this.namespace[context.namespace]={
                '_':new UniqueID({namespace:context.namespace}),
                '.':new NOLLinePos({namespace:context.namespace})
            };
            this.header.nsnline[context.namespace]=nline;
            context.anamepat=regExpFromAName(context.htll.aname);
        }
        return this.namespace[context.namespace]
    }
    action( {tag ,nline,text,context }){
        if (tag.closing) return;
        const {name,href}=tag.attrs;
        const ns=this.namespaceObject(context,nline);
        name?addAName(tag,ns,context,name,nline,text):addHref(tag,href,this.hrefs,nline,text);
    }
    serialize(){
        let out=[];
        for (let ns in this.namespace) {            
            const feature={};
            const NS=this.namespace[ns];
            for (let name in NS) {
                if (NS[name].pushCount()){
                    out=out.concat(NS[name].serialize());
                    feature[name]=true;
                }
                this.header.aname[ns]=feature;
            }
        }
        out=out.concat(this.hrefs.serialize());
        out.unshift(JSON.stringify(this.header));
        return out;
    }
    deserialize(payload){
        this.header=JSON.parse(payload.shift());
        if (this.header.aname) for (let ns in this.header.aname){
            const feature=this.header.aname[ns];
            const obj={};
            for (let name in feature) {
                if (name=='_') {
                    obj._=new UniqueID({ns, name});
                    obj._.deserialize( payload );
                } else {
                    obj[name]=new NOLLinePos({ns, name});
                    obj[name].deserialize(payload)
                }
            }
            this.namespace[ns]=obj;
        };
        this.hrefs=new HREFs();
        this.hrefs.deserialize(payload)
    }
    parse(addr){
        return parseAddress(this.namespace,this.header.nsnline,addr);
 
    }
}
export default LabelAnchor ;