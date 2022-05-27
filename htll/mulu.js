import Label from './label.js'
import {pack,unpack,pack_delta,unpack_delta} from'../utils/index.js';
import {trimInnerMulu} from './trimmulu.js';
import {fromBase26} from 'pitaka/utils';

class LabelMulu extends Label {
    constructor(name,opts={}) {
        super(name,opts);
        this.caption=opts.caption||'目錄';
        this.names=[];
        this.level=[];
        this.linepos=[];
        this.trimlocal=opts.trimlocal; 
        this.context=opts.context;
        this.compact=opts.compact;
        this.notquickpointer=true;
        this.id=opts.id;
        this.prevdepth=0;
        return this;
    }
    action( tag ,linetext){
        const {x,w,y}=tag;
        let depth,id;
        if (tag.name.length>1) {
          depth=fromBase26(tag.name.slice(1))+2; // level 1 reserved for chunk breaker
          id=tag.attrs.id;
        } else {
          depth=parseInt(tag.attrs.id)||this.id;
        }
        if (depth>0) {
            const t= (!this.compact&&tag.attrs.t)? tag.attrs.t.trim() : linetext.substr(x,w);
            this.names.push(t);
            if (depth-1>this.prevdepth) {
                console.log('warning prev depth',this.prevdepth,'tag',tag)
            }
            this.level.push(depth);
            this.linepos.push(y);
            this.prevdepth=depth;
            this.count++;
        } else {
            throw 'invalid level '+depth+' at '+y+' '+linetext;
        }
    }
    reseting(parenttag) { //add a milestone
        this.names.push('');
        this.level.push(0); //impossible value
        this.linepos.push(parenttag.y);
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
        console.log('before trim',this.linepos.length)
        const {names,level,linepos}=trimInnerMulu(this.names,this.level,this.linepos);
        this.names=names;
        this.level=level;
        this.linepos=linepos;

        console.log('after trim',this.linepos.length,names)
        // const levels=this.level;
        // const out=[];
        // this.names.forEach((n,idx)=>out.push(levels[idx]+'\t'.repeat(parseInt(levels[idx])) +n));
        // fs.writeFileSync( 't30-trim.txt',out.join('\n'),'utf8')
    }
}
export default LabelMulu;