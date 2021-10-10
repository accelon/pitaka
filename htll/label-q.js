import Label from './label.js'
import {parsePointer} from '../offtext/pointers.js'
import {pack3,unpack3,pack_delta,unpack_delta,packStrings,unpackStrings,bsearch} from'../utils/index.js';

class LabelQuote extends Label {
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
            if (!this.Q[ptk][bk][ptr.c])this.Q[ptk][bk][c]=[];
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

        out.push(packStrings(this.ptks));
        out.push(pack_delta(this.ptks_start));
        
        out.push(packStrings(this.books));
        out.push(pack_delta(this.books_start));

        out.push(packStrings(this.chunks));
        out.push(pack_delta(this.chunks_start));

        out.push(packStrings(this.hooks));  //compress same dy
        out.push(pack3(this.linepos)); 

        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.ptks=unpackStrings(payload[at++]);
        this.ptks_starts=unpack_delta(payload[at++]);

        this.books=unpackStrings(payload[at++]);
        this.books_starts=unpack_delta(payload[at++]);

        this.chunks=unpackStrings(payload[at++]);
        this.chunks_starts=unpack_delta(payload[at++]);

        this.hooks=unpackStrings(payload[at++]);
        this.linepos=unpack3(payload[at++]);
    }
    finalize() {
        // this.log('finalize q')
    }
}

export default LabelQuote;