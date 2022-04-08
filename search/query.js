import {plAnd,getCounter, getSpeed} from './posting.js';
const queryCache={};

export const phraseQuery=async (ptk,phrase)=>{
    phrase=phrase.trim();
    const qkey=ptk.name+'@'+phrase;    
    let out=queryCache[qkey];
    if (out) return out;
    const tokens=await ptk.prepareToken(phrase);
    out=tokens[0][1];
    for (let i=1;i<tokens.length;i++) {
        let pl1=out;
        out=plAnd(pl1,tokens[i][1],i);
    }
    queryCache[qkey]=out;
    return out;
};

export const validateTofind=str=>{
    return (str||'').replace(/[\[\]&%$#@\/\^]/g,'').trim();
}
export default {phraseQuery,validateTofind};