import Label from './label.js'
import {parsePointer} from '../offtext/pointers.js'
import {pack3,unpack3,pack_delta,unpack_delta,bsearch} from'../utils/index.js';
import { DELTASEP } from '../platform/constants.js';

class LabelTransclusion extends Label {
    constructor(name,opts={}) {
        super(name,opts);
        this.Q={};
        this.ptks=[];             // names of target pitaka
        this.ptks_start=[];       // starting quote number
        this.books=[];           //name of books
        this.books_start=[];     // starting quote number
        this.chunks=[];           //name of chunks
        this.chunks_start=[];     // starting quote number
        this.hooks=[];           // the target hooks of each quotes, sorted by target ptk/bk/c
        this.ypos=[];           // this is not in order, should not use the name of linepos
        return this;
    }
    action(tag){
        const ptr=parsePointer(tag.attrs['@']); // ptk, bk, c, dy, hook
        if (ptr && ptr.basket){ //only deal with external quote
            const {basket,bk,c,dy,hook} = ptr;
            if (!this.Q[basket])this.Q[basket]={};
            if (!this.Q[basket][bk])this.Q[basket][bk]={};
            if (!this.Q[basket][bk][c])this.Q[basket][bk][c]=[];
            this.Q[basket][bk][c].push([tag.y,dy,hook]);
        }
    }
    serialize(){
        for (let basket in this.Q ) {
            this.ptks.push(basket)
            this.ptks_start.push(this.hooks.length);
            for (let bk in this.Q[basket]) {
                this.books.push(bk)
                this.books_start.push(this.hooks.length);    
                for (let c in this.Q[basket][bk]) {
                    this.chunks.push(c)
                    this.chunks_start.push(this.hooks.length);

                    this.Q[basket][bk][c].sort((a,b)=>a[0]==b[0]?a[1]-b[1]:a[0]-b[0] );// sort by source line pos, then dy
                    for (let i=0;i<this.Q[basket][bk][c].length;i++) {
                        const [srcy, dy, hook] = this.Q[basket][bk][c][i];
                        this.ypos.push(srcy); 
                        this.hooks.push(dy+'^'+hook);   
                    }
                }
            }
        }
        
        const out=super.serialize();

        out.push(this.ptks.join("\t"));
        out.push(pack_delta(this.ptks_start));
        
        out.push(this.books.join("\t"));
        out.push(pack_delta(this.books_start));

        out.push(this.chunks.join("\t"));
        out.push(pack_delta(this.chunks_start));

        out.push(this.hooks.join("\t"));  //compress same dy
        out.push(pack3(this.ypos)); 
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload)||0;
        this.ptks=payload[at++].split('\t');payload[at-1]='';
        this.ptks_start=unpack_delta(payload[at++]);payload[at-1]='';

        this.books=payload[at++].split('\t');payload[at-1]='';
        this.books_start=unpack_delta(payload[at++]);payload[at-1]='';

        this.chunks=payload[at++].split('\t');payload[at-1]='';
        this.chunks_start=unpack_delta(payload[at++]);payload[at-1]='';

        this.hooks=payload[at++].split('\t');payload[at-1]='';
        this.ypos=unpack3(payload[at++]);payload[at-1]='';
    }
    countBacklinks(str) {
        let ptr=str;
        if (typeof str=='string') ptr=parsePointer(str);
        if (!ptr) return 0;

        const {bk,c} = ptr;
        const last=this.ypos.length-1;
        let at=this.books.indexOf(bk);
        if (at==-1) return 0;
        let start=this.books_start[at];
        let end = this.books_start[at+1] || last;
        if (!c) return end-start;
        
        at = bsearch(this.chunks_start,start,true);
        at = this.chunks.indexOf( c ,at);
        end = this.chunks_start[at+1] || last;
        start = this.chunks_start[at];
        return end-start;
    }
    getBacklinks(str,ystart=0) { //fetch all links in range of bk or bk/c
        let ptr=str;
        const res={};
        if (typeof str=='string') ptr=parsePointer(str);
        if (!ptr) return res;
        const {bk,c} = ptr;
        const last=this.ypos.length-1;
        let at=this.books.indexOf(bk);
        if (at==-1) return res;
        let start=this.books_start[at];

        let i,end;
        at = bsearch(this.chunks_start,start,true);
        if (c[0]===DELTASEP) {
            i=this.chunks_start[at+parseInt(c.substr(1))]
            end=this.chunks_start[at+parseInt(c.substr(1))+1] || last;
        } else {
            at = this.chunks.indexOf( c ,at);
            i = this.chunks_start[at];
            end = this.chunks_start[at+1] || last;
        }
        while (i<end) {
            const arr=this.hooks[i].split('^');
            const dy=parseInt(arr[0]);
            const hook=arr[1];
            if (!res[dy+ystart]) res[dy+ystart]=[];
            res[dy+ystart].push([hook, this.ypos[i] ]);
            i++;
        }
        return res;
    }
    finalize() {
        // this.log('finalize q')
    }
}

export default LabelTransclusion;