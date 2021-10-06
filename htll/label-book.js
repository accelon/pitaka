import Label from './label.js'
import {pack_delta,unpack_delta,packStrings,unpackStrings} from'../utils/index.js';

class LabelBook extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.pat=/^(pre) ([^>]+)/i
        this.names=[];
        this.idarr=[];
        this.linepos=[];
        this._idarr={};
        return this;
    }
    action(tag ,linetext){
        let {y,pos,width}=tag;
        const id=(tag.attrs.id||tag.attrs.n)||' ';
        if (width==0) width=linetext.length;
        this.names.push(linetext.substr(pos,width));
        this.linepos.push(y);
        if (this._idarr[id]) throw 'repeated idarr, '+id+' at '+line ;

        this._idarr[id]=y;
        this.idarr.push(id);
        return true;
    }
    finalize(){
        this.log('finalize book')
    }
    serialize(){
        const out=[];
        out.push(packStrings(this.names));
        out.push(pack_delta(this.linepos)); 
        out.push(packStrings(this.idarr)); 
        return out;
    }
    deserialize(payload){
        let at=0;
        this.names=unpackStrings(payload[at++]);
        this.linepos=unpack_delta(payload[at++])
        this.idarr=unpackStrings(payload[at++]);
        return at;
    }
    getRange(nheadword){
    }
    find(tofind,near=false){
    }
}
export default LabelBook;