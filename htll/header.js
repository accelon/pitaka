import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta,bsearch,parseArg} from'../utils/index.js';
import UniqueID from './uid.js';
class LabelHeader extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.headerLinePos=[];
        this.header={depth:0};
        this.scope='';
        return this;
    }
    action( {tag ,nline}){
        if (tag.closing)return;

        const level=parseInt(tag.ele.substr(1))-1;
        if (level+1>this.header.depth) this.header.depth=level+1;
        
        // const innertext=text.substr(tag.rawoffset+tag.len).replace(/<.+/,'');
        
        if (!this.headerLinePos[level])this.headerLinePos[level]=[];
        this.headerLinePos[level].push(nline);
        this.count++;
    }
    serialize(){
        let out=this.headerLinePos.map(pack_delta);
                
        out.unshift(JSON.stringify(this.header));
        return out;
    }
    deserialize(payload){
        this.header=JSON.parse(payload.shift());
        const headerLinePos=payload.splice(0,this.header.depth);
        this.headerLinePos=headerLinePos.map(unpack_delta);
    }
}
export default LabelHeader;