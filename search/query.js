import {plAnd,getCounter, getSpeed} from './posting.js';
const queryCache={};

export const phraseQuery=async (ptk,phrase)=>{
    phrase=phrase.trim();
    const qkey=ptk.name+'@'+phrase;    
    let out=queryCache[qkey];
    if (out) return out;
    const tokens=await ptk.prepareToken(phrase);
    if (!tokens) return [];

    out=tokens[0][1];
    for (let i=1;i<tokens.length;i++) {
        let pl1=out;
        out=plAnd(pl1,tokens[i][1],i);
    }
    queryCache[qkey]=out;
    return out;
};

export const parseQuery=async (ptk,tofind,opts)=>{
    const phrases=tofind.split(/[ 　]/);
    if (phrases.length>5) phrases.length=5;
    const outphrases=[], postings=[];
    for (let i=0;i<phrases.length;i++) {
        if (!phrases[i].trim()) continue;
        let posting=await phraseQuery(ptk,phrases[i]);
        if (!posting.length && opts.tosim) {
            ph=fromSim(phrases[i]);
            posting=await phraseQuery(ptk,phrases[i]);
        }
        if (opts.ranges && opts.ranges.length) {//only search in ranges
            posting=plRanges(posting,opts.ranges);
        }
        outphrases.push(phrases[i]);
        postings.push(posting)
    }
    return [outphrases,postings];
}
export const validateTofind=str=>{
    return (str||'').replace(/[\[\]&%$#@\/\^]/g,'').trim();
}
export default {phraseQuery,validateTofind};