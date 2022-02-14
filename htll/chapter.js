import Label from './label.js'
import {unpack_delta} from'../utils/index.js';
/*
  support multiple level,    num/alpha/num/alpha, e.g
  ^c0s56b2  mula(1 for att,2 for tik) samyutta 56 , second vagga , 2 sutta tathāgatasuttaṃ
  ^c[id=s56b2] longer
  cluster id must be unique
*/

class LabelChapter extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.caption=opts.caption||'章';
        this.names=[];
        this.idarr=[];
        this.linepos=[];
        this._idarr={};
        this.context=opts.context;
        return this;
    }
    action( tag ,linetext){
        const {y}=tag;
        const id=tag.attrs.id;

        if (this._idarr[id]||!id) { //missing 
            console.log(tag,linetext)
            if (!id) id=='<NULL>';
            throw "repeated cluster id "+id+" at "+y ;
        }
        this.count++;
        this._idarr[id]=true;
        const text=tag.w?linetext.substr(tag.x,tag.w):' ';
        this.names.push(text.replace(/\r?\n/g,' ')|| ' ');
        this.idarr.push(id||'_');
        this.linepos.push(y);
    }
    reseting() {
        this._idarr={};
    }
    serialize(){
        const out=super.serialize();
        out.push(this.names.join('\t'));  
        out.push(this.linepos); 
        out.push(this.idarr.join('\t'));  
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.names=payload[at++].split('\t');payload[at-1]='';
        this.linepos=unpack_delta(payload[at++]);payload[at-1]='';
        this.idarr=payload[at++].split('\t');payload[at-1]='';
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
    finalize(ctx) {

    }
}
export default LabelChapter;