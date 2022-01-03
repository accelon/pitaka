import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta} from'../utils/index.js';

class LabelFootnote extends Label {
    constructor(name,opts={}) {
        super(name,opts);
        this.caption=opts.caption||'注釋';
        this.fnarr=[];
        this.linepos=[];
        this.context=opts.context;
        return this;
    }
    action( tag ,linetext){
        const {x,w,y}=tag;
        const n=parseInt(tag.attrs.n)||this.n;
        if (n>0) {
            this.fnarr.push(n);
            this.linepos.push(y);
            this.count++;
        } else {
            throw 'invalid id '+tag.attrs.n+' at '+y+' '+linetext;
        }
    }
    reset(parenttag) {
    }
    serialize(){
        const out=super.serialize();
        out.push(pack(this.fnarr));
        out.push(pack_delta(this.linepos)); 
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.fnarr=unpack(payload[at++]);payload[at-1]='';
        this.linepos=unpack_delta(payload[at++]);payload[at-1]='';
    }
    getRange(nheadword){
    }
    find(tofind,near=false){
    }
    finalize() {

    }
}
export default LabelFootnote;