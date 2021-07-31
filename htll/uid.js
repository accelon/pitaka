import {pack3,unpack3,alphabetically0} from '../utils/index.js'
import HTLLField from './htllfield.js';
export default class UniqueID  extends HTLLField {
    constructor (opts={}){
        super(opts);
        this._id={};
        this.id=[];
        this.name=opts.name||'';
        this.linePos=[];
    }
    push(id,linepos) {
        super.push();
        if (!id)return;
        if (this._id[id]) throw "repeated id "+id;
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