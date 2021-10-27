import Label from './label.js'
import {pack_delta,pack3,unpack3,unpack_delta,packStrings,unpackStrings,bsearch} from'../utils/index.js';
class LabelDictEntry extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.idarr=[];
        this.linepos=[];
        this.prevhw='';
        this.textual=true;
        this.prevy=0;
        this.rankBySize=[];//1表示top 1% 
        this.entrysize=[];
        return this;
    }
    action(tag,linetext,ctx){
        let {y,pos,width}=tag;
        let hw=linetext.substr(pos);
        if (hw==this.prevhw) return;
        ctx.entry=hw;
        const lastentrysize=ctx.linesOffset[y-ctx.startY]-ctx.linesOffset[this.prevy-ctx.startY];
        if (this.prevy) this.entrysize.push(lastentrysize);
        this.idarr.push(hw);
        this.prevhw=hw;
        this.linepos.push(y);
        this.prevy=y;
    }

    parse(addr){
        let HW=this.idarr;
        let tf=addr;
        let at=bsearch(HW,tf);
        while (at==-1 && tf) {
            tf=tf.substr(0,tf.length-1);
            at=bsearch(HW,tf);
        }
        if (at>-1) {
            return {text:tf,nline:this.linepos[at]};
        }
    }
    serialize(){
        const out=[];
        const hw=packStrings(this.idarr);
        out.push(hw);  //58ms 
        out.push(pack3(this.entrysize));
        out.push(pack_delta(this.linepos)); 
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.idarr=unpackStrings(payload[at++]);payload[at-1]=''; // 28.ms 
        this.entrysize=unpack3(payload[at++]);payload[at-1]='';
        this.linepos=unpack_delta(payload[at++]);payload[at-1]='';
    }
    getRange(n){
        if (typeof n!=='number') {
            n=bsearch(this.idarr,n);
        }
        if (n<0) return null;
        const start=this.linepos[n];
        const end=n<this.linepos.length-1? this.linepos[n+1]: this.lastLine;
        return [start,end,n];
    }
    find(tofind,near=false){
        return bsearch(this.idarr,tofind,near);
    }
    finalize(labeldefs,ctx){
        const lastentrysize=ctx.linesOffset[ctx.lineCount]
                           -ctx.linesOffset[this.prevy-ctx.startY];
        this.entrysize.push(lastentrysize);
    }
}
export default LabelDictEntry;