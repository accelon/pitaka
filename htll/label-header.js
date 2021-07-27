import Label from './label.js'
class LabelHeader extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.pat=/H([\d])/
        this.headerLinePos=[];
        return this;
    }
    action( {tag ,nline}){
        const level=parseInt(tag.raw.match(this.pat)[1])-1;
        if (!this.headerLinePos[level])this.headerLinePos[level]=[];
        this.headerLinePos[level].push(nline);
        if (tag.offset!==0) {
            console.error('Header must begin of line, ln:',nline);
        }
    }
    serialize(){
        const out=[];
        this.headerLinePos.forEach(linepos=>{
            out.push(linepos.join(','));
        })
        return out;
    }
    deserialize(payload){
        this.headerLinePos=payload.map(nums=>JSON.parse('['+nums+']'))
    }
}
export default LabelHeader;