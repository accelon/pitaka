import Label from './label.js'
import {pack_delta,pack,unpack,unpack_delta,packStrings,unpackStrings,bsearch} from'../utils/index.js';
class LabelEntry extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.idarr=[];
        this.linepos=[];
        this.prevhw='';
        this.textual=true;
        this.prevy=0;
        this.rankBySize=[];//1表示top 1% 
        this.entrysize=[];

        this.attrs=(opts.attrs||'').split(',').filter(it=>!!it);
        this.attributes={};
        for (let i=0;i<this.attrs.length;i++) this.attributes[this.attrs[i]]=[];
        return this;
    }
    action(tag,linetext,ctx){
        let {y,pos,width}=tag;
        let hw=linetext.substr(pos);
        if (hw==this.prevhw) return;
        ctx.entry=hw;
        const lastentrysize=ctx.linesOffset[y-ctx.startY]-ctx.linesOffset[this.prevy-ctx.startY];
        if (this.prevy) this.entrysize.push(lastentrysize);
        this.idarr.push(hw);
        this.prevhw=hw;
        this.linepos.push(y);
        this.prevy=y;

        //build language attributes
        if (this.attrs.length) {
            for (let key in this.attributes) {
                this.attributes[key].push(tag.attrs[key]||'');
            }
        }
    }
    parse(addr){
        let HW=this.idarr;
        let tf=addr;
        let at=bsearch(HW,tf);
        while (at==-1 && tf) {
            tf=tf.substr(0,tf.length-1);
            at=bsearch(HW,tf);
        }
        if (at>-1) {
            return {text:tf,nline:this.linepos[at]};
        }
    }
    serialize(){
        const out=[];
        out.push(JSON.stringify({attrs:this.attrs}));
        const hw=packStrings(this.idarr);
        out.push(hw);  //58ms 
        out.push(pack(this.entrysize));
        out.push(pack_delta(this.linepos)); 
        for (let attr in this.attributes) {
            out.push( this.attributes[attr].join('\t'));
        }
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        const header=JSON.parse(payload[at++]);payload[at-1]=''; 

        this.idarr=unpackStrings(payload[at++]);payload[at-1]=''; 
        this.entrysize=unpack(payload[at++]);payload[at-1]='';
        this.linepos=unpack_delta(payload[at++]);payload[at-1]='';
        this.attrs=header.attrs;
        this.attributes={};
        for (let i=0;i<this.attrs.length;i++) {
            this.attributes[this.attrs[i]]=payload[at++].split('\t');payload[at-1]=''; ;
        }
    }
    getAttrs(n){
        const out=[];
        for (let i=0;i<this.attrs.length;i++) {
            const attrname=this.attrs[i];
            if (this.attributes[attrname][n]) out.push([ attrname, this.attributes[attrname][n]]);
        }
        return out;
    }
    getRange(n){
        if (typeof n!=='number') {
            n=bsearch(this.idarr,n);
        }
        if (n<0) return null;
        const start=this.linepos[n];
        const end=n<this.linepos.length-1? this.linepos[n+1]: this.lastLine;
        return [start,end,n];
    }
    find(tofind,near=false){
        return bsearch(this.idarr,tofind,near);
    }
    finalize(ctx){
        const lastentrysize=ctx.linesOffset[ctx.lineCount]
                           -ctx.linesOffset[this.prevy-ctx.startY];
        this.entrysize.push(Math.floor(10*Math.log(0.01+lastentrysize)) );
    }
}
export default LabelEntry;