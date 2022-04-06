import Label from './label.js'
import {unpack_delta,packStrings,unpackStrings} from'../utils/index.js';
import {serialize_keywords,deserialize_keywords} from "./labelkeyword.js";

class LabelBook extends Label {
    constructor(name,opts={}) {
        super(name,opts);
        this.caption=opts.caption||'代號';
        this.names=[];
        this.idarr=[];
        this.linepos=[];
        this._idarr={};
        this.keywords={}; // forward index of keywords  nbook: array of keyword idx
        this._maxkeyword=0;
        return this;
    }
    action(tag ,linetext){
        let {y,x,w}=tag;
        const id=(tag.attrs.id)||' ';
        if (w==0) w=linetext.length;
        this.linepos.push(y);
        if (this._idarr[id]) {
     	   throw 'repeated bk id, '+id+' at ';
    	}
        this._idarr[id]=y;
        this.idarr.push(id);
        this.count++;
    }
    serialize(){
        const {keylabels,labelsout}=serialize_keywords(this);
        const out=[];
        //header 
        out.push(JSON.stringify({keywords:keylabels.length,maxkeyword:this._maxkeyword}) );
        out.push(packStrings(this.names));
        out.push(this.linepos);
        out.push(packStrings(this.idarr));

        if (keylabels.length) {
            out.push(keylabels.join('\t'));
            out.push(...labelsout)    
        }
        return out;
    }
    deserialize(payload,lastTextLine){
        let at=super.deserialize(payload);
        const options=JSON.parse(payload[at++]);payload[at-1]='';
        this.names=unpackStrings(payload[at++]);payload[at-1]='';
        this.linepos=unpack_delta(payload[at++]);payload[at-1]='';
        this.idarr=unpackStrings(payload[at++]);payload[at-1]='';
    
        if (options.keywords) {
            deserialize_keywords(this);
        }
        return at;
    }
    getRange(nheadword){
    }
    query(tofind){
        const matches=[];
        for (let i=0;i<this.names.length;i++) {
            const at=this.names[i].indexOf(tofind);
            if (at>-1) {
                matches.push({at:i, name:this.names[i], id:this.idarr[i], linepos:this.linepos[i]});
            }
        }
        return { tofind, caption:this.caption, matches, count:matches.length};
    }
    finalize(){
    }
}
export default LabelBook;