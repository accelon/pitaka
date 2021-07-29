import Label from './label.js'
import {pack_delta,unpack_delta,packStrings,unpackStrings,bsearch} from'../utils/index.js';
class LabelDictEntry extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.pat=/^H(.*)/
        this.headword=[];
        this.linePos=[];
        this.prevhw='';
        this.normalizeText=opts.normalizeText;
        return this;
    }
    action( {tag ,nline,text}){
        let hw=text.substr(tag.rawoffset+tag.len);
        if (this.normalizeText) hw=this.normalizeText(hw);
        if (hw==this.prevhw) return;
        this.headword.push(hw);
        this.prevhw=hw;
        this.linePos.push(nline);

    }
    serialize(){
        const out=[];
        const hw=packStrings(this.headword);
        // writeFileSync('hw.txt',this.headword.join('\n'),'utf8');
        out.push(hw);  //58ms 
        out.push(pack_delta(this.linePos)); 
        // console.log('hw length',this.headword.length)
        // console.log('linePos length',this.linePos.length)
        return out;
    }
    deserialize(payload){
        this.headword=unpackStrings(payload[0]);// 28.ms
        this.linePos=unpack_delta(payload[1])
    }
    getRange(nheadword){
        if (typeof nheadword!=='Number') {
            nheadword=bsearch(this.headword,nheadword);
        }
        if (nheadword<0) return null;
        const start=this.linePos[nheadword];
        const end=nheadword<this.linePos.length-1? this.linePos[nheadword+1]: this.lastLine;
        return [start,end];
    }
    find(tofind,near=false){
        return bsearch(this.headword,tofind,near);
    }
}
export default LabelDictEntry;