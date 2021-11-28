import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta,packStrings,unpackStrings,bsearch} from'../utils/index.js';

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
        const id=(tag.attrs.id||tag.attrs.n)||' ';

        if (this._idarr[id]) {
            console.log(tag,linetext)
            throw 'repeated chunk id, '+id+' at '+y ;
        }

        this._idarr[id]=true;
        this.names.push(linetext.replace(/\r?\n/g,' ')|| ' ');
        this.idarr.push(id||'_');
        this.linepos.push(y);
    }
    reset() {
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