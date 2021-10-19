import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta,packStrings,unpackStrings,bsearch} from'../utils/index.js';

class LabelLinePos extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.keys=[];
        this.lineposs=[];

        this._keywords={};
        this.context=opts.context;
        return this;
    }
    action( tag ,linetext){
        const {y}=tag;
        const kw=linetext.substr(tag.x,tag.w);
        if (!this._keywords[kw]) this._keywords[kw]=[];
        this._keywords[kw].push(y);
    }
    reset() {
    }
    serialize(){
        const out=super.serialize();
        const keywords=[];
        for (let k in this._keywords) {
            keywords.push([k,this._keywords[k]]);
        }
        keywords.sort((a,b)=>b[1].length-a[1].length);
        const keys=keywords.map(i=>i[0]);
        const arr=keywords.map(i=>i[1]);
        
        out.push(keys.join('\t'));
        for (let i=0;i<arr.length;i++) {
            out.push(pack_delta(arr[i]));
        }
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.keys=payload[at++].split('\t');payload[at-1]='';
        for (let i=0;i<this.keys.length;i++) {
            this.lineposs[i]=unpack_delta(payload[at++]);payload[at-1]='';
        }
    }
    finalize() {
    }
}
export default LabelLinePos;