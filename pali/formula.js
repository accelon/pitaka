import {readTextContent,readTextLines} from '../platform/fsutils.js'
import {bsearch} from '../utils/bsearch.js'

export class Formula {
    constructor (fn) {
        const config=JSON.parse(readTextContent(fn).replace(/\/\/.*\n/g,'\n'));
        this.lexicon=readTextLines(config.lexicon);
        this.decompose=readTextLines(config.decompose);
    }
    isLemma(w){
        const at=bsearch(this.lexicon,w );
        return at>-1;
    }
    factorize(w){
        if (this.isLemma(m1)) return [1,m1]  ;

    }
}
