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
        this.names=[];
        this.named=opts.named;
        this.reset=opts.reset;
        return this;
    }
    action( tag ,linetext){
        const {y}=tag;
        const n=parseInt(tag.attrs.id)||0;
        
        if (!n) {
            if (tag.x) console.warn("cannot have empty milestone in the middle of text, at line",y);
            else return;//ignore ^n
        }
        if (tag.w && !this.named) {
            console.warn("should not enclose text",tag);
        } 
        if (this.named) {
            this.names.push(linetext.slice(tag.x,tag.x+tag.w));
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
        if (this.reset&& this.prevn==1 && y!==this.parenty) {
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
        out.push(JSON.stringify({named:this.named}));
        out.push(pack_delta(this.linepos)); 
        this.named&&out.push(packStrings(this.names));
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        const header= JSON.parse(payload[at++]);; payload[at-1]='';
        this.named=header.named;
        this.linepos=unpack_delta(payload[at++]); payload[at-1]='';
        this.names=header.named?unpackStrings(payload[at++]):[]; payload[at-1]='';
        this.count=this.linepos.length-1;
    }
    finalize() {
    }
}
export default LabelMilestone;