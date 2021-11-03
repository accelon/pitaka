import {plAnd,getCounter} from './posting.js';
export const phraseQuery=async (ptk,phrase)=>{
    console.time('prepare')

    const tokens=await ptk.prepareToken(phrase);
    console.timeEnd('prepare')

    let out=tokens[0].posting;
    console.time('phrase')
    for (let i=1;i<tokens.length;i++) {
        let pl1=out;
        out=plAnd(pl1,tokens[i].posting,i);
    }
    console.timeEnd('phrase')
    console.log('match counter',getCounter())
    return out;
};

export default {phraseQuery};