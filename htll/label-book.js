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
        this.log('book',linetext,tag)
        
        // if (tag.raw.substr(0,3).toLowerCase()=='pre') {        
        //     let name=text.substr(tag.rawoffset+tag.len).replace(/>.*/,'');    
        //     const id=tag.raw.match(this.pat)[2].trim().toLowerCase();
        //     this.bookNames.push(name);
        //     if (this._bookId[id]) throw 'repeated bookid , at '+nline ;
        //     this._bookId[id]=nline;
        //     this.bookId.push(id);
        //     this.bookLinePos.push(nline);
        //     return true;
        // } 
    }
    finalize(){
        this.log('finalize book')
        // this.chapterCount.push(this.chapterCount);
        // this.chapterCount=0;
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