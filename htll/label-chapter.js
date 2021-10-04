import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta,packStrings,unpackStrings,bsearch} from'../utils/index.js';

class LabelChapter extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.pat=/^[bc]([A-Z\d]+)/
        this.names=[];
        this.idarr=[];
        this.linepos=[];
        this._idarr={};
        this.context=opts.context;
        return this;
    }
    action( tag ,linetext){
        const {line}=tag;
        const id=tag.attrs.id||tag.attrs.n||'';
        this.names.push(linetext);
        this.idarr.push(id);
        this.linepos.push(line);
        return true;
    }
    serialize(){
        const out=super.serialize();
        out.push(packStrings(this.names));  
        out.push(pack_delta(this.linepos)); 
        out.push(packStrings(this.idarr));  
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.names=unpackStrings(payload[at++]);
        this.linepos=unpack_delta(payload[at++])
        this.idarr=unpackStrings(payload[at++]);
    }
    getRange(nheadword){
    }
    find(tofind,near=false){
    }
    finalize() {
        this.log('finalize chapter')
    }
}
export default LabelChapter;