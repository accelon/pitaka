import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta,packStrings,unpackStrings,bsearch} from'../utils/index.js';

class LabelBookChapter extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.pat=/^[bc]([A-Z\d]+)/
        this.chapterNames=[];
        this.chapterId=[];
        this.chapterLinePos=[];
        this._chapterId={};
        this.context=opts.context;
        return this;
    }
    action( tag ,linetext){
        // this.log('ch',text,tag)
        // let name=text.substr(tag.rawoffset+tag.len);
        // const id=tag.raw.substr(1).trim();
        // if (tag.raw[0]=='c') {
        //     this.chapterNames.push(name);
        //     if (this._chapterId[id]) throw 'repeated chapterid' ;
        //     this._chapterId[id]=nline;
        //     this.chapterId.push(id);    
        //     this.chapterLinePos.push(nline);
        // }
    }
    serialize(){
        const out=super.serialize();
        out.push(packStrings(this.chapterNames));  
        out.push(pack_delta(this.chapterLinePos)); 
        out.push(packStrings(this.chapterId));  
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.chapterNames=unpackStrings(payload[at++]);
        this.chapterLinePos=unpack_delta(payload[at++])
        this.chapterId=unpackStrings(payload[at++]);
    }
    getRange(nheadword){
    }
    find(tofind,near=false){
    }
    finalize() {
        this.log('finalize chapter')
    }
}
export default LabelBookChapter;