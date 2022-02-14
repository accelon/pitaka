import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta} from'../utils/index.js';

class LabelFootnote extends Label {
    constructor(name,opts={}) {
        super(name,opts);
        this.caption=opts.caption||'注釋';
        this.fnarr=[];
        this.linepos=[];
        this.idarr={};
        this.context=opts.context;
        return this;
    }
    action( tag ,linetext){
        const {x,w,y}=tag;
        const id=tag.attrs.id;
        if (this.idarr[id]) {
        	console.log("repeated footnote id",id);
        } else {
	        this.fnarr.push(id);
	        this.linepos.push(y);
	        this.count++;
        }	
    }
    reseting(parenttag) {
    	this.idarr={};
    }
    serialize(){
        const out=super.serialize();
        out.push(pack(this.fnarr));
        out.push(pack_delta(this.linepos)); 
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.fnarr=unpack(payload[at++]);payload[at-1]='';
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