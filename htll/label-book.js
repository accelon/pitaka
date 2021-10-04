import Label from './label.js'
import {pack_delta,unpack_delta,packStrings,unpackStrings} from'../utils/index.js';

class LabelBook extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.pat=/^(pre) ([^>]+)/i
        this.bookNames=[];
        this.bookId=[];
        this.bookLinePos=[];
        this._bookId={};
        return this;
    }
    action(tag ,linetext){
        let {line,pos,width}=tag;
        const id=tag.attrs.id||tag.attrs.n||'';
        if (width==0) width=linetext.length;
        this.bookNames.push(linetext.substr(pos,width));

        if (id) {
            if (this._bookId[id]) throw 'repeated bookid, at '+line ;
            this._bookId[id]=line;
            this.bookId.push(id);            
        }
        return true;
    }
    finalize(){
        this.log('finalize book')
    }
    serialize(){
        const out=[];
        out.push(packStrings(this.bookNames));
        out.push(pack_delta(this.bookLinePos)); 
        out.push(packStrings(this.bookId)); 
        return out;
    }
    deserialize(payload){
        let at=0;
        this.bookNames=unpackStrings(payload[at++]);
        this.bookLinePos=unpack_delta(payload[at++])
        this.bookId=unpackStrings(payload[at++]);
        return at;
    }
    getRange(nheadword){
    }
    find(tofind,near=false){
    }
}
export default LabelBook;