import Label from './label.js'
import {unpack_delta} from'../utils/index.js';
import { doAttributes,labelByTypeName } from './labelutils.js';
import {serializeAttributes,deserializeAttributes} from './attributes.js'
import {FOOTNOTE_SUFFIX} from '../platform/constants.js'

/*
  support multiple level,    num/alpha/num/alpha, e.g
  ^c0s56b2  mula(1 for att,2 for tik) samyutta 56 , second vagga , 2 sutta tathāgatasuttaṃ
  ^c[id=s56b2] longer
  chunk id must be unique
*/

class LabelChunk extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.caption=opts.caption||'章';
        this.names=[];
        this.idarr=[];
        this.linepos=[];
        this._idarr={};
        this.context=opts.context;
        this.hasname=false;
        return this;
    }
    action( tag ,linetext,ctx){
        const {y}=tag;
        const id=tag.attrs.id;
        super.action();
        doAttributes(this,tag,linetext);
        if (this._idarr[id]||!id) { //missing 
            console.log(tag,linetext)
            if (!id) id=='<NULL>';
            throw "repeated chunk id "+id+" at "+y ;
        }
        this._idarr[id]=true;
        const text=tag.w?linetext.substr(tag.x,tag.w):' ';
        const caption=text.replace(/\r?\n/g,' ')|| '';

        const bk=ctx.closest['LabelBook'];

        // if (bk && bk.attrs.id && !bk.attrs.id.endsWith(FOOTNOTE_SUFFIX)) {
            if (caption) this.hasname=true;
            this.names.push(caption);
            this.idarr.push(id||'_');
            this.linepos.push(y);            
        // }
    }
    reseting() {
        this._idarr={};
    }
    serialize(){
        const out=super.serialize();
        const lblheader={hasname:this.hasname}
        if (this.attrIndex&&Object.keys(this.attrIndex).length) lblheader.attrs =true;
        out.push(JSON.stringify(lblheader));
        out.push(this.linepos); 
        out.push(this.idarr.join('\t'));  
        if (this.hasname) out.push(this.names.join('\t')); 
        return out.concat(serializeAttributes(this.attrIndex));
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        const opts=JSON.parse(payload[at++]);payload[at-1]='';
        this.hasname=opts.hasname;
        this.linepos=unpack_delta(payload[at++]);payload[at-1]='';
        this.idarr=payload[at++].split('\t');payload[at-1]='';
        if (this.hasname && payload[at]) this.names=payload[at++].split('\t');payload[at-1]='';
        if (opts.attrs) this.attrIndex=deserializeAttributes(payload,at);
    }
    finalize(ctx) {

    }
}
export default LabelChunk;