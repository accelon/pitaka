import Label from './label.js'
class LabelLink extends Label {
    constructor(name,opts={}) {
        super(name,opts);
        this.caption=opts.caption||"連結";
        return this;
    }
    action(tag){
    }
    serialize(){
        return [];
    }
    deserialize(payload){
        // let at=super.deserialize(payload);
        // this.linepos=unpack_delta(payload[at++]);payload[at-1]='';
    }
}
export default LabelLink;