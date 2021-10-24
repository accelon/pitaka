import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta} from'../utils/index.js';
import {trimInnerMulu} from './trimmulu.js';

class LabelMulu extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.names=[];
        this.level=[];
        this.linepos=[];
        this.chunkStarts=[]; //beginning y of each page
        this.trimlocal=opts.trimlocal; 
        this.context=opts.context;
        return this;
    }
    action( tag ,linetext){
        const {y}=tag;
        const n=parseInt(tag.attrs.n);
        if (n>0) {
            this.names.push(tag.attrs.t.trim());
            this.level.push(n);
            this.linepos.push(y);    
        } else {
            throw 'invalid level '+n+' at '+y+' '+linetext;
        }
    }
    reset(parenttag) { //add a milestone
        this.names.push('');
        this.level.push(0); //impossible value
        this.linepos.push(parenttag.y);
        // console.log(parenttag)
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
        // console.log('before trim',this.linepos.length)
        const {names,level,linepos}=trimInnerMulu(this.names,this.level,this.linepos);
        this.names=names;
        this.level=level;
        this.linepos=linepos;
        // console.log('after trim',this.linepos.length)

        // const levels=this.level;
        // const out=[];
        // this.names.forEach((n,idx)=>out.push(levels[idx]+'\t'.repeat(parseInt(levels[idx])) +n));
        // fs.writeFileSync( 't30-trim.txt',out.join('\n'),'utf8')
    }
}
export default LabelMulu;