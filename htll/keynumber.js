import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta,bsearch} from'../utils/index.js';

class LabelKeynumber extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.keys=[];
        this.lineposs=[];
        this.context=opts.context;
        this.master=opts.master;
        this.caption=opts.caption;
        this.cols=(opts.cols||1)
        return this;
    }
    action( tag ,linetext){
        const {x,w}=tag;
        const kw=linetext.substr(x,w);
        let kn=praseInt(kw);
        if (this.cols>1) {
            const colnumber=tag.attrs.id.charCodeAt(tag.attrs.id.length-1)-0x61;
            kn=kw.substr(kw.length-1)*colnumer;
        }
        if (!this.linepos[kn]) this.linepos[kn]=[];
        this.lineposs[kn].push(tag.y);
        this.count++;
    }
    reseting() {
    }
    serialize(){
        const out=super.serialize();
        out.push(JSON.stringify({caption:this.caption,length:this.lineposs.length,cols:this.cols}));
        for (let i=0;i<this.lineposs.length;i++) {
            out.push(pack_delta(this.lineposs[i]));
        }
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        const header=JSON.parse(payload[at++]);payload[at-1]='';
        this.caption=header.caption;
        this.cols=header.cols;
        for (let i=0;i<header.length;i++) {
            this.lineposs[i]=unpack_delta(payload[at++]);payload[at-1]='';
        }
    }
    finalize() {

    }
}
export default LabelKeynumber;