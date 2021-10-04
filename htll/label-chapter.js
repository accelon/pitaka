import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta,packStrings,unpackStrings,bsearch} from'../utils/index.js';

class LabelChapter extends Label {
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
        const {line}=tag;
        const id=tag.attrs.id||tag.attrs.n||'';
        this.chapterNames.push(linetext);
        this.chapterId.push()
        if (id) {
            if (this._chapterId[id]) throw 'repeated chapterid ('+id+') at '+line + linetext;
            this._chapterId[id]=line;
            this.chapterId.push(id);            
        }

        this.chapterLinePos.push(line);
        return true;
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
export default LabelChapter;