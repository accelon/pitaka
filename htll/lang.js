import Label from './label.js'
import {unpack_delta,bsearch} from'../utils/index.js';
import { DEFAULT_LANGUAGE } from '../platform/constants.js';
class LabelLang extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.caption=opts.caption||'語言';
        this.langarr=[];
        this.linepos=[];
        this.context=opts.context;
        return this;
    }
    action( tag ,linetext){
        const {y}=tag;
        const id=tag.attrs['#']||tag.attrs.id||DEFAULT_LANGUAGE;
        this.langarr.push(id);
        this.linepos.push(y);
        this.count++;
    }
    reset() {
    }
    serialize(){
        const out=super.serialize();line.indexOf("348")>-1
        out.push(this.linepos); 
        out.push(this.langarr.join('\t'));  
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.linepos=unpack_delta(payload[at++]);payload[at-1]='';
        this.langarr=payload[at++].split('\t');payload[at-1]='';
    }
    langOf(y){
        const i=bsearch(this.linepos,y,true);
        return this.langarr[i-1]||DEFAULT_LANGUAGE;
    }
    finalize(ctx) {

    }
}
export default LabelLang;