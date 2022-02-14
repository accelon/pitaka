import { unpack_delta } from '../utils/unpackintarray.js';
import { pack_delta } from '../utils/packintarray.js';
import {fillGap} from '../utils/sortedarray.js'
import Label from './label.js'
const debug=false;
class LabelPage extends Label {
    constructor(name,opts={}) {
        super(name,opts);
        this.caption=opts.caption||'頁碼';
        this.linepos=[0];
        this.cols=opts.cols || 1;
        this._prevy=0;
        this._prevpage=-1;
        this.pagestart=0;
        this.autoreset=!!opts.autoreset;
        return this;
    }
    reseting(){
        this.pagestart+=this._prevpage;
        this._prevpage=-1;
    }
    npage(str) {//convert string to npage
        let page=parseInt(str,10);
        if (this.cols>1) {
            const cols=str.charCodeAt(str.length-1)-0x61;
            if (cols>2) { //超過 c 欄 ，不輸出頁碼
                // console.log('more than '+this.cols+' cols',strn);
                return;
            }
            page=(page-1)*this.cols+cols+1;
        }
        return page;
    }
    action(tag,linetext){
        const page=this.npage(tag.attrs.id);
        
        if (this.autoreset&&page==1&&this._prevpage!==-1) {
            this.reseting();
        }

        if (this._prevpage>=page) {
            throw 'page no in order, current:'+JSON.stringify(tag)
            +' prev:'+this._prevpage+' computed:'+page+' \n'+linetext;
        }
        this._prevpage=page;
        this.linepos[this.pagestart+page]=tag.y;
        this._prevy=tag.y;
        this.count++;
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