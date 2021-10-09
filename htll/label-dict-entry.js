import Label from './label.js'
import {pack_delta,unpack_delta,packStrings,unpackStrings,bsearch} from'../utils/index.js';
class LabelDictEntry extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.names=[];
        this.linepos=[];
        this.prevhw='';
        this.textual=true;
        return this;
    }
    action(tag,linetext){
        let {y,pos,width}=tag;
        let hw=linetext.substr(pos);
        if (hw==this.prevhw) return;
        this.names.push(hw);
        this.prevhw=hw;
        this.linepos.push(y);
    }
    parse(addr){
        let HW=this.names;
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
        const hw=packStrings(this.names);
        // writeFileSync('hw.txt',this.names.join('\n'),'utf8');
        out.push(hw);  //58ms 
        out.push(pack_delta(this.linepos)); 
        // console.log('hw length',this.names.length)
        // console.log('linePos length',this.linePos.length)
        return out;
    }
    deserialize(payload){
        this.names=unpackStrings(payload[0]);// 28.ms
        this.linepos=unpack_delta(payload[1])
    }
    getRange(n){
        if (typeof n!=='number') {
            n=bsearch(this.names,n);
        }
        if (n<0) return null;
        const start=this.linepos[n];
        const end=n<this.linepos.length-1? this.linepos[n+1]: this.lastLine;
        return [start,end,n];
    }
    find(tofind,near=false){
        return bsearch(this.names,tofind,near);
    }
}
export default LabelDictEntry;