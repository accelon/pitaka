import {readTextContent,readTextLines} from '../platform/fsutils.js'
import {bsearch} from '../utils/bsearch.js'
import {enumBases} from './stem.js'
import {removeSubstring} from '../utils/array.js'
import {lexify,syllablify,stringifyLex} from 'provident-pali'


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
    findPossible(w,decompose) {
        const at=bsearch(decompose,w+'=',true);
        if (at>-1 && decompose[at].slice(0,w.length)==w && decompose[at][w.length]=='=') {
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
    findOrth(w,decompose) {
        const at=bsearch(decompose,w+'=',true);
        if (at>-1 && decompose[at].slice(0,w.length)==w && decompose[at][w.length]=='=') {
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
    guess(w) { //simple guest
        //try stem
        let possible=[];
        const debug=(w==='yTABUAtYANdsVsnAnIsMsO');
        const syls=syllablify(w);
        // debug&&console.log(syls)
        for (let i=0;i<syls.length;i++){
            for (let j=1;j<=syls.length;j++) {
                const ww=syls.slice(i,j).join('');
                if (!ww)continue;
                if (this.isLemma(ww) && possible.indexOf(ww)==-1) possible.push(ww);
                for (let k=0;k<this.decomposes.length;k++) {
                    const out=this.findOrth(ww,this.decomposes[k]);
                    if (out && possible.indexOf(out)==-1) possible.push(ww)
                }
            }
        }

        possible=possible.filter(it=>it.length>1)
        possible=removeSubstring(possible,debug);
                debug&&console.log(w,possible)

        const lex=lexify(w,possible);
        if (possible.length>1 && !lex.filter(it=>it==-1).length && lex.length) {
            const fullmatch=lex.join('')==w;
            if (fullmatch) return stringifyLex(lex);
            return possible;
        } return null;
    }
}
