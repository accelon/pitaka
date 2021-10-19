import { unpack_delta } from '../utils/unpackintarray.js';
import { pack_delta } from '../utils/packintarray.js';
import {fillGap} from '../utils/sortedarray.js'
import Label from './label.js'
class LabelPage extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.linepos=[];
        this.cols=opts.cols || 1;
        this.prevy=0;
        this.pagestart=0;
        return this;
    }
    reset(){
        this.pagestart=this.prevy;
    }
    action(tag){
        let page=parseInt(tag.attrs.n,10);
        if (this.cols>1) {
            const cols=tag.attrs.n.charCodeAt(tag.attrs.n.length-1)-0x61;
            page=(page-1)*this.cols+cols;
        }
        this.linepos[this.pagestart+page]=tag.y;
        this.prevy=tag.y;
        
    }
    human(){
        
    }
    serialize(){
        fillGap(this.linepos);
        const out=[];
        out.push( pack_delta(this.linepos));
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.linepos=unpack_delta(payload[at]);payload[at]='';
    }
}
export default LabelPage;