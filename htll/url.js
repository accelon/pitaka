import Label from './label.js'
class LabelURL extends Label {
    constructor(name,opts={}) {
        super(name,opts);
        this.linepos=[];
        this.named=opts.named;
        this.caption=opts.caption||"連結";
        return this;
    }
    action(tag,linetext){
    	this.linepos.push(tag.y);
    	this.named? this.names.push(tag.attrs.id||' ');
    }
    serialize(){
        const out=super.serialize();
        out.push(JSON.stringify({named:this.named}));
        out.push(pack_delta(this.linepos)); 
        this.named&&out.push(packStrings(this.names));
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.linepos=unpack_delta(payload[at++]);payload[at-1]='';
    }
}
export default LabelLink;