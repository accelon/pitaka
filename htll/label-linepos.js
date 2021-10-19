import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta,packStrings,unpackStrings,bsearch} from'../utils/index.js';

class LabelLinePos extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.linepos=[];
        this.prevn=0;
        this.sequencial=opts.sequencial;
        this.context=opts.context;
        return this;
    }
    action( tag ,linetext){
        const {y}=tag;
        const n=parseInt(tag.attrs.n)||0;

        if (this.sequencial) {
            if (n!==this.prevn+1){
                console.log(tag,linetext, n, this.prevn+1)
                throw ''+tag.attrs.n+'prev'+this.prevn+' at '+y ;
            }
        }
        this.prevn=n;
        this.linepos.push(y);
    }
    reset() {
        this.prevn=0;
    }
    serialize(){
        const out=super.serialize();
        out.push(pack_delta(this.linepos)); 
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.linepos=unpack_delta(payload[at]);payload[at]='';
    }
    finalize() {
    }
}
export default LabelLinePos;