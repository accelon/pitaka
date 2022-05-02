import {readTextContent,readTextLines} from '../platform/fsutils.js'
import {bsearch} from '../utils/bsearch.js'

export class Formula {
    constructor (fn) {
        const config=JSON.parse(readTextContent(fn).replace(/\/\/.*\n/g,'\n'));
        this.lexicon=readTextLines(config.lexicon);
        let decomposes=config.decomposes;
        if (typeof decomposes=='string') decomposes=decomposes.split(',');
        this.decomposes=decomposes.map(fn=>readTextLines(fn));
    }
    isLemma(w){
        const at=bsearch(this.lexicon,w );
        return at>-1;
    }
    findOrth(w,decompose) {
        const at=bsearch(decompose,w+'=',true);
        if (at>-1 && decompose[at].slice(0,w.length)==w) {
            let lex=decompose[at].slice(w.length+1), p=0;
            if (parseInt(lex)) {
                const breaks=lex;
                lex='';
                for (let i=0;i<breaks.length;i+=2) {
                    const to=parseInt(breaks.slice(i,i+2),10);
                    if (i) lex+='0';
                    lex+=w.slice(p,to);
                    p=to;
                }
                lex+='0'+w.slice(p);
            }
            return lex;
        }
    }
    factorize(w){
        if (this.isLemma(w)) return w ;
        for (let i=0;i<this.decomposes.length;i++) {
            const out=this.findOrth(w,this.decomposes[i]);
            if (out) return out;
        }
        return null;
    }
}
