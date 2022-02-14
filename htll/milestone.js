import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta,packStrings,unpackStrings,bsearch} from'../utils/index.js';

class LabelMilestone extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.linepos=[];
        this.prevn=0;
        this.sequencial=opts.sequencial;
        this.context=opts.context;
        this.parenty=0;
        return this;
    }
    action( tag ,linetext){
        const {y}=tag;
        const n=parseInt(tag.attrs.id)||0;
        
        if (!n) {
            if (tag.x) console.warn("cannot have empty milestone in the middle of text, at line",y);
            else return;//ignore ^n
        }
        if (tag.w) {
            console.warn("milestone should not enclose text",tag);
        }
        if (this.sequencial) {
            if (n!==this.prevn+1){
                // console.log(tag,linetext, n, this.prevn+1)
                if (this.prevn>n) console.warn('prev id is bigger, forgot to reset ?');
                const line=y-this.context.startY;
                throw 'linepos not in order, '+tag.attrs.id+' prev '+this.prevn+' at '+line+ ' file '+this.context.filename;
            }
        }
        const at=tag.attrs.id.indexOf('-');
        if (this.range && at>0) { //sn and an has range paranum
            const nextn=parseInt(tag.attrs.id.substr(at+1));
            if (nextn<n) {
                const line=y-this.context.startY;
                throw "wrong range number "+tag.attrs.id+' at '+line;
            } else {
                let fillcount=nextn-n+1;
                this.count+= fillcount;
                this.prevn=nextn;
                while (fillcount>0) {
                    this.linepos.push(y);
                    fillcount--;
                }
            }
        } else {
            this.count++;
            this.prevn=n;    
            this.linepos.push(y);
        }
        if (this.prevn==1 && y!==this.parenty) {
            console.warn(tag);
            const line=y-this.context.startY;
            throw "missing parent tag on line #"+line;
        }
    }
    reseting(parenttag) {
        this.parenty=parenttag.y;  //
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
export default LabelMilestone;