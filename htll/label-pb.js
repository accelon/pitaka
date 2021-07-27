import Label from './label.js'
class LabelPB extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.pat=/pb([\d]+)/
        this.del=true;
        this.linePos=[];
        this.chPos=[];
        this.pageNumber=[];
        return this;
    }
    action( {tag ,nline}){
        const value=tag.raw.match(this.pat)[1];
        this.linePos.push(nline);
        this.chPos.push(tag.offset);
        this.pageNumber.push(value);
        tag.del=true;
    }
    serialize(){
        const out=[];
        out.push(this.linePos.join(','));
        out.push(this.chPos.join(','));
        out.push(this.pageNumber.join(','));
        return out;
    }
    deserialize(payload){
        this.linePos=JSON.parse('['+payload[0]+']');
        this.chPos=JSON.parse('['+payload[1]+']');
        this.pageNumber=JSON.parse('['+payload[2]+']');
    }
}
export default LabelPB;