import Label from './label.js'
import {pack_delta,unpack_delta} from'../utils/index.js';

class LabelKeyword extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.keys=[];
        this.context=opts.context;
        this.master=opts.master; //master tag
        this.positions=[];       //出現此keyword 的 nth master
        this.caption=opts.caption;
        //build time only
        this._keywords={};
        this.sort=opts.sort;
        this._sortedKeywords=[];
        return this;
    }
    action( tag ,linetext,ctx){
        const {x,w}=tag;
        const kw=linetext.substr(x,w);
        if (!this._keywords[kw]) this._keywords[kw]=[];
        this.count++;
        const master=ctx.labeldefs[this.master];
        if (master.linepos&&master.linepos.length) {
            this._keywords[kw].push(master.linepos.length-1 );
        }
    }
    reseting() {
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
            this.positions[i]=unpack_delta(payload[at++]);payload[at-1]='';
        }
    }
    finalize(ctx) {
        const keywords=[];
        for (let k in this._keywords) {
            keywords.push([k,this._keywords[k]]);
        }
        if (this.sort) keywords.sort((a,b)=>b[1].length-a[1].length);

        this._sortedKeywords=keywords;
        const master=ctx.labeldefs[this.master];
        master.addKeywords(this.name,keywords);
    }
    positionOf(n) {
        const  at=(typeof n=='string')?this.keys.indexOf(n):n;
        const positions=[... (this.positions[at]) ];
        return positions;
    }
    query(tofind){
        const at=this.keys.indexOf(tofind);
        if (at>-1) {
            const positions=[... (this.positions[at]) ];
            return {tofind, caption:this.caption, positions, count:positions.length };
        }
        return {tofind, caption:this.caption,count:0};
    }
}
export default LabelKeyword;