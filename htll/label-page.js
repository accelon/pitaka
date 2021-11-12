import { unpack_delta } from '../utils/unpackintarray.js';
import { pack_delta } from '../utils/packintarray.js';
import {fillGap} from '../utils/sortedarray.js'
import Label from './label.js'
const debug=false;
class LabelPage extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.linepos=[0];
        this.cols=opts.cols || 1;
        this._prevy=0;
        this._prevpage=-1;
        this.pagestart=0;
        this.autoreset=!!opts.autoreset;
        return this;
    }
    reset(){
        this.pagestart+=this._prevpage;
        this._prevpage=-1;
    }
    action(tag,linetext){
        let page=parseInt(tag.attrs.n,10);
        if (this.autoreset&&page==1&&this._prevpage!==-1) {
            this.reset();
        }

        if (this.cols>1) {
            const cols=tag.attrs.n.charCodeAt(tag.attrs.n.length-1)-0x61;
            if (cols>2) { //超過 c 欄 ，不輸出頁碼
                // console.log('more than '+this.cols+' cols',tag.attrs.n);
                return;
            }
            page=(page-1)*this.cols+cols+1;
        }

        if (this._prevpage>=page) {
            throw 'page no in order '+tag.attrs.n+' '+this._prevpage+' '+page+' '+linetext;
        }
        this._prevpage=page;
        this.linepos[this.pagestart+page]=tag.y;
        this._prevy=tag.y;
    }
    indexOf(pg){
        let co=0;
        if (this.cols>1) {
            const m=pg.match(/([a-z])$/);
            co=m?(m[1].toLowerCase().charCodeAt(0)-0x61):0;
        } 
        return ((parseInt(pg,10)-1)*this.cols)+co;
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