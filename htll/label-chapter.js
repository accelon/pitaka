import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta,packStrings,unpackStrings,bsearch} from'../utils/index.js';

class LabelChapter extends Label {
    constructor(name,opts={}) {
        super(name,opts)
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
        out.push(pack_delta(this.linepos)); 
        out.push(this.idarr.join('\t'));  
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.names=payload[at++].split('\t');payload[at-1]='';
        this.linepos=unpack_delta(payload[at++]);payload[at-1]='';
        this.idarr=payload[at++].split('\t');payload[at-1]='';
    }
    getRange(nheadword){
    }
    find(tofind,near=false){
    }
    finalize(ctx) {

    }
}
export default LabelChapter;