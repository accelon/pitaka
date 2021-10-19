import Label from './label.js'
import {pack_delta,unpack_delta,packStrings,unpackStrings} from'../utils/index.js';

class LabelBook extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.names=[];
        this.idarr=[];
        this.linepos=[];
        this._idarr={};
        return this;
    }
    action(tag ,linetext){
        let {y,x,w}=tag;
        const id=(tag.attrs.id||tag.attrs.n)||' ';
        if (w==0) w=linetext.length;
        this.names.push(linetext.substr(x,w));
        this.linepos.push(y);
        if (this._idarr[id]) throw 'repeated bk id, '+id+' at '+linetext ;

        this._idarr[id]=y;
        this.idarr.push(id);
    }
    serialize(){
        const out=[];
        out.push(packStrings(this.names));
        out.push(pack_delta(this.linepos)); 
        out.push(packStrings(this.idarr)); 
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.names=unpackStrings(payload[at++]);payload[at-1]='';
        this.linepos=unpack_delta(payload[at++]);payload[at-1]='';
        this.idarr=unpackStrings(payload[at++]);payload[at-1]='';
        return at;
    }
    getRange(nheadword){
    }
    find(tofind,near=false){
    }
    finalize(){
        this.log('finalize book')
    }
}
export default LabelBook;