import {pack3,unpack3,alphabetically0, bsearch} from '../utils/index.js'
import HTLLField from './htllfield.js';
export default class UniqueID  extends HTLLField {
    constructor (opts={}){
        super(opts);
        this._id={};
        this.id=[];
        this.name=opts.name||'';
        this.linePos=[];
    }
    closest(nline) { //找到最接近的同類錨點，只在顯示時用到，速度要求不大。
        let at=0,min=100000000;
        for (let i=0;i<this.linePos.length;i++) {
            const line=this.linePos[i];
            if (nline>=line) continue;
            if (min>line-nline) {
                min=line-nline;
                at=i;
            }
        }
        return this.linePos[at];
    }
    nlineOf(str){
        const at=bsearch(this.id,str);
        if (at>-1) {
            const nline=this.linePos[at];
            const end=this.closest(nline);
            return [nline, end] ;
        }
    }
    push(id,linepos) {
        super.push();
        if (!id)return;
        if (this._id[id]) throw "repeated id "+id+ ' line:'+linepos;
        this._id[id]=linepos;
        return true;
    }
    serialize(){
        const sorted=[],out=[];
        for (let id in this._id) {
            sorted.push([id,this._id[id]]);
        }
        sorted.sort(alphabetically0);
        out.push( sorted.map(item=>item[0]).join('\t'));
        out.push( pack3(sorted.map(item=>item[1])));
        return out;
    }
    deserialize(payload){
        this.id=payload[0].split('\t');
        this.linePos=unpack3(payload[1]);
        payload.shift();
        payload.shift();
    }
}