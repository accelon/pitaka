import { unpack_delta } from '../utils/unpackintarray.js';
import { pack_delta } from '../utils/packintarray.js';
import {fillGap} from '../utils/sortedarray.js'
import Label from './label.js'
class LabelVol extends Label {
    constructor(name,opts={}) {
        super(name,opts);
        this.caption=opts.caption||"冊";
        this.linepos=[];
        return this;
    }
    action(tag){
        const vol=parseInt(tag.attrs.id)-1;
        this.count++;
        this.linepos[vol]=tag.y;
    }
    indexOf(vol) {
        return parseInt(vol)-1;
    }
    serialize(){
        fillGap(this.linepos);
        const out=[];
        out.push( pack_delta(this.linepos));
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.linepos=unpack_delta(payload[at++]);payload[at-1]='';
    }
}
export default LabelVol;