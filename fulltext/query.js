import {plAnd,getCounter, getSpeed} from './posting.js';
export const phraseQuery=async (ptk,phrase)=>{
    // console.time('prepare')
    const tokens=await ptk.prepareToken(phrase);
    // console.timeEnd('prepare')

    let out=tokens[0][1];
    // console.time('phrase')
    for (let i=1;i<tokens.length;i++) {
        let pl1=out;
        out=plAnd(pl1,tokens[i][1],i);
    }

    return out;
};

export const validateTofind=str=>{
    return (str||'').replace(/\^/g,'').trim();
}
export default {phraseQuery,validateTofind};