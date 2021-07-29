import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta,bsearch,parseArg} from'../utils/index.js';
import UniqueID from './uid.js';
class LabelHeader extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.pat=/^h([\d])/i
        this.headerLinePos=[];
        this.header={depth:0};
        this.scopeuid={};
        this.scope='';
        return this;
    }
    action( {tag ,nline,text}){
        const level=parseInt(tag.ele.substr(1))-1;
        if (level+1>this.header.depth) this.header.depth=level+1;
        const Uid=this.scope?this.scopeuid[this.scope]:null;
        const innertext=text.substr(tag.rawoffset+tag.len).replace(/<.+/,'');
        if (level==0) {
            this.scope=''; //reset scope
            if (tag.attrs && tag.attrs.scope) {
                this.scopeuid[tag.attrs.scope]=new UniqueID({scope:this.scope,name:innertext});
                this.scope=tag.attrs.scope;
            }
        }
        
        if (!this.headerLinePos[level])this.headerLinePos[level]=[];
        this.headerLinePos[level].push(nline);

        Uid&&Uid.push((tag.attrs&&tag.attrs.id)||innertext ,nline);
        // if (innertext=='乾') console.log(tag)
        if (tag.offset!==0) {
            console.error('Header must begin of line, ln:',nline);
        }
    }
    serialize(){
        let out=this.headerLinePos.map(pack_delta);

        for (let scope in this.scopeuid) {
            this.header.scope={};
            const out2=this.scopeuid[scope].serialize();
            this.header.scope[scope]=this.scopeuid[scope].name;
            out=out.concat(out2);
        }
                
        out.unshift(JSON.stringify(this.header));
        return out;
    }
    deserialize(payload){
        this.header=JSON.parse(payload.shift());
        const headerLinePos=payload.splice(0,this.header.depth);
        this.headerLinePos=headerLinePos.map(unpack_delta);
        if (this.header.scope) for (let scope in this.header.scope){
            const uid=new UniqueID({scope,name:this.header.scope[scope]});
            uid.deserialize( payload );
            this.scopeuid[scope]=uid;
        };
    }
}
export default LabelHeader;