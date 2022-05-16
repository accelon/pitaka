import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta,packStrings,unpackStrings} from'../utils/index.js';

class LabelFootnote extends Label {
    constructor(name,opts={}) {
        super(name,opts);
        this.caption=opts.caption||'注釋';
        this.idarr=[];
        this.linepos=[];
        this._idarr={};
        this.context=opts.context;
        return this;
    }
    action( tag ,linetext){
        const {x,w,y}=tag;
        const id=tag.attrs.id;
        if (this._idarr[id]) {
        	console.log("repeated footnote id",id);
        } else {
	        this.idarr.push(id);
	        this.linepos.push(y);
	        this.count++;
        }
        this._idarr[id]=true
    }
    reseting(parenttag) {
    	this._idarr={};
    }
    serialize(){
        const out=super.serialize();
        const fnarrpack=packStrings(this.idarr);
        const linepospack=pack_delta(this.linepos)
        out.push(fnarrpack); 
        out.push(linepospack); 
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.idarr=unpackStrings(payload[at++]);payload[at-1]='';
        this.linepos=unpack_delta(payload[at++]);payload[at-1]='';
    }
    getRange(nheadword){
    }
    find(tofind,near=false){
    }
    finalize() {

    }
}
export default LabelFootnote;