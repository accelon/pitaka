import {readTextContent,readTextLines} from '../platform/fsutils.js'
import {bsearch} from '../utils/bsearch.js'
import {alphabetically} from '../utils/sortedarray.js'
import {enumBases} from './stem.js'
import {removeSubstring} from '../utils/array.js'
import {fromIAST,toIAST,lexify,syllablify,formulate,orthOf} from 'provident-pali'


export class Formula {
    constructor (fn, json) {
        const config=Object.assign(JSON.parse(readTextContent(fn).replace(/\/\/.*\n/g,'\n')),json);
        this.lexicon=readTextLines(config.lexicon);
        const isIAST=(config.encoding==='iast');
        this.isIAST=isIAST;
        if (config.encoding==='iast') this.lexicon=this.lexicon.map(fromIAST);
        this.lexicon.sort(alphabetically);

        let decomposes=config.decomposes;
        if (typeof decomposes==='string') decomposes=decomposes.split(',');
        this.decomposes=decomposes.map(fn=>{
            let entries=readTextLines(fn);
            if(isIAST)entries=entries.map(fromIAST);
            entries.sort(alphabetically);
            return entries;
        })
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
    expandLex(lex){
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

    findOrth(w,decompose) {
        const at=bsearch(decompose,w+'=',true);
        if (at>-1 && decompose[at].slice(0,w.length)==w && decompose[at][w.length]=='=') {
            let lex=decompose[at].slice(w.length+1), p=0;
            return this.expandLex(lex).split('-');
        }
    }
    factorize(w){
        if (this.isLemma(w)) return w ;
        for (let i=0;i<this.decomposes.length;i++) {
            const parts=this.findOrth(w,this.decomposes[i]);
            if (parts) {
                const lex=lexify(w,parts);
                const lexstr=formulate(lex);
                if (orthOf(lexstr)===w) {//make sure it can recover
                    return formulate(lex);
                } else {
                    console.log('cannot lex ',this.isIAST?toIAST(w):w,  this.isIAST?parts.map(toIAST):parts, this.isIAST?w:'')                    
                }
            }
        }
        return null;
    }
    forEach(cb,I=0){ 
        for (let i=0;i<this.decomposes.length && i<=I;i++) {
            for (let j=0;j<this.decomposes[i].length;j++) {
                const raw=this.decomposes[i][j];
                const at=raw.indexOf('=');
                if (~at) {
                    const orth=raw.slice(0,at);
                    const parts=raw.slice(at+1).split('-');
                    cb(orth,parts,raw); 
                }
            }
        }
    }
    guess(w) { //simple guest
        //try stem
        let possible=[];
        const syls=syllablify(w);
        // debug&&console.log(syls)
        for (let i=0;i<syls.length;i++){
            for (let j=1;j<=syls.length;j++) {
                const ww=syls.slice(i,j).join('');
                if (!ww)continue;
                if (this.isLemma(ww) && possible.indexOf(ww)==-1) possible.push(ww);
                for (let k=0;k<this.decomposes.length;k++) {
                    const out=this.findOrth(ww,this.decomposes[k]);
                    if (out && possible.indexOf(ww)==-1) possible.push(ww)
                }
            }
        }

        possible=possible.filter(it=>it.length>1)
        possible=removeSubstring(possible,debug);

        debug&&console.log(w,possible)
        const lex=lexify(w,possible);

        if (possible.length>1 && !lex.filter(it=>it==-1).length && lex.length) {
            const fullmatch=lex.join('')==w;
            if (fullmatch) return formulate(lex);
        }
        return possible;
    }
}
