import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta} from'../utils/index.js';

class LabelMulu extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.names=[];
        this.level=[];
        this.linepos=[];
        this.pageStarts=[]; //beginning y of each page
        this.trimlocal=opts.trimlocal; 
        this.context=opts.context;
        return this;
    }
    action( tag ,linetext){
        const {y}=tag;
        this.names.push(tag.attrs.t.trim());
        this.level.push(parseInt(tag.attrs.l));
        this.linepos.push(y);
    }
    reset(parenttag) {
        this.pageStarts.push(parenttag.y);
    }
    trimLocal(){
        //remove local tree
    }
    serialize(){
        const out=super.serialize();
        out.push(this.names.join("\t"));  
        out.push(pack_delta(this.linepos)); 
        out.push(pack(this.level));  
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.names=payload[at++].split("\t");payload[at-1]='';
        this.linepos=unpack_delta(payload[at++]);payload[at-1]='';
        this.level=unpack(payload[at++]);payload[at-1]='';
    }
    getRange(nheadword){
    }
    find(tofind,near=false){
    }
    finalize() {
        // this.log('finalize chapter')
    }
}
export default LabelMulu;