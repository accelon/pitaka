import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta,packStrings,unpackStrings,bsearch} from'../utils/index.js';

class LabelKeyword extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.keys=[];
        this.lineposs=[];
        this.context=opts.context;
        this.master=opts.master;
        this.caption=opts.caption;
        //build time only
        this._keywords={};
        this._sortedKeywords=[];
        return this;
    }
    action( tag ,linetext){
        const {x,w}=tag;
        const kw=linetext.substr(x,w);
        if (!this._keywords[kw]) this._keywords[kw]=[];
        if (this.master.linepos&&this.master.linepos.length) {
            this._keywords[kw].push( this.master.linepos.length-1 );
        }
    }
    reset() {
    }
    serialize(){
        const out=super.serialize();
        const keys=this._sortedKeywords.map(i=>i[0]);
        const arr=this._sortedKeywords.map(i=>i[1]);
        out.push(this.caption);
        out.push(keys.join('\t'));
        for (let i=0;i<arr.length;i++) {
            out.push(pack_delta(arr[i]));
        }
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.caption=payload[at++];payload[at-1]='';
        this.keys=payload[at++].split('\t');payload[at-1]='';
        for (let i=0;i<this.keys.length;i++) {
            this.lineposs[i]=unpack_delta(payload[at++]);payload[at-1]='';
        }
    }
    finalize() {
        const keywords=[];
        for (let k in this._keywords) {
            keywords.push([k,this._keywords[k]]);
        }
        keywords.sort((a,b)=>b[1].length-a[1].length);

        this._sortedKeywords=keywords;
        this.master.addKeywords(this.name,keywords);
    }
}
export default LabelKeyword;