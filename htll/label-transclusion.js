import Label from './label.js'
import {parsePointer} from '../offtext/pointers.js'
import {pack3,unpack3,pack_delta,unpack_delta,packStrings,unpackStrings,bsearch} from'../utils/index.js';

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
        this.linepos=[];         // the line pos of each quotes
        return this;
    }
    action(tag){
        const ptr=parsePointer(tag.attrs['@']); // ptk, bk, c, dy, hook
        if (ptr && ptr.ptk){ //only deal with external quote
            const {ptk,bk,c,dy,hook} = ptr;
            if (!this.Q[ptk])this.Q[ptk]={};
            if (!this.Q[ptk][bk])this.Q[ptk][bk]={};
            if (!this.Q[ptk][bk][c])this.Q[ptk][bk][c]=[];
            this.Q[ptk][bk][c].push([tag.y,dy,hook]);
        }
    }
    serialize(){
        for (let ptk in this.Q ) {
            this.ptks.push(ptk)
            this.ptks_start.push(this.hooks.length);
            for (let bk in this.Q[ptk]) {
                this.books.push(bk)
                this.books_start.push(this.hooks.length);    
                for (let c in this.Q[ptk][bk]) {
                    this.chunks.push(c)
                    this.chunks_start.push(this.hooks.length);

                    this.Q[ptk][bk][c].sort((a,b)=>a[0]==b[0]?a[1]-b[1]:a[0]-b[0] );// sort by source line pos, then dy
                    for (let i=0;i<this.Q[ptk][bk][c].length;i++) {
                        const [srcy, dy, hook] = this.Q[ptk][bk][c][i];
                        this.linepos.push(srcy);
                        this.hooks.push(dy+'^'+hook);   
                    }
                }
            }
        }
        
        const out=super.serialize();

        out.push(this.ptks.join("|"));
        out.push(pack_delta(this.ptks_start));
        
        out.push(this.books.join("|"));
        out.push(pack_delta(this.books_start));

        out.push(this.chunks.join("|"));
        out.push(pack_delta(this.chunks_start));

        out.push(this.hooks.join("|"));  //compress same dy
        out.push(pack3(this.linepos)); 
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.ptks=payload[at++].split('|');
        this.ptks_start=unpack_delta(payload[at++]);

        this.books=payload[at++].split('|');
        this.books_start=unpack_delta(payload[at++]);

        this.chunks=payload[at++].split('|');
        this.chunks_start=unpack_delta(payload[at++]);

        this.hooks=payload[at++].split('|');
        this.linepos=unpack3(payload[at++]);
    }
    getBacklinks(str,ystart=0) { //fetch all links in range of bk/c
        let ptr=str;
        const res={};
        if (typeof str=='string') ptr=parsePointer(str);
        if (ptr){
            const {bk,c} = ptr;
            const last=this.linepos.length-1;
            let at=this.books.indexOf(bk);
            if (at==-1) return res;
            let start=this.books_start[at];

            at = bsearch(this.chunks_start,start,true);

            at = this.chunks.indexOf( c ,at);

            let i = this.chunks_start[at];
            const end = this.chunks_start[at+1] || last;

            while (i<end) {
                const arr=this.hooks[i].split('^');
                const dy=parseInt(arr[0]);
                const hook=arr[1];
                if (!res[dy+ystart]) res[dy+ystart]=[];
                res[dy+ystart].push([hook, this.linepos[i] ]);
                i++;
            }
        }
        return res;
    }
    finalize() {
        // this.log('finalize q')
    }
}

export default LabelTransclusion;