import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta,packStrings,unpackStrings,bsearch} from'../utils/index.js';

class LabelLinePos extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.linepos=[];
        this.prevn=0;
        this.sequencial=opts.sequencial;
        this.range=opts.range;
        this.context=opts.context;
        return this;
    }
    action( tag ,linetext){
        const {y}=tag;
        const n=parseInt(tag.attrs.id)||0;
        if (this.sequencial) {
            if (n!==this.prevn+1){
                console.log(tag,linetext, n, this.prevn+1)
                throw 'linepos not in order, '+tag.attrs.id+' prev '+this.prevn+' at '+y ;
            }
        }
        const at=tag.attrs.id.indexOf('-');
        if (this.range && at>0) { //sn and an has range paranum
            const nextn=parseInt(tag.attrs.id.substr(at+1));
            if (nextn<n) {
                throw "wrong range number "+tag.attrs.id+' at '+y;
            } else {
                this.count+= nextn-n+1;
                this.prevn=nextn;    
            }
        } else {
            this.count++;
            this.prevn=n;    
            this.linepos.push(y);
        }
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