import {plAnd,getCounter} from './posting.js';
export const phraseQuery=async (ptk,phrase)=>{
    console.time('prepare')

    const tokens=await ptk.prepareToken(phrase);
    console.timeEnd('prepare')

    let out=tokens[0].posting;
    console.time('phrase')
    for (let i=1;i<tokens.length;i++) {
        let pl1=out;       
        out=[];
        const pl2=tokens[i].posting;
        for (let j in pl1) {
            if (pl2[j]) {
                const a1=typeof pl1[j]=='number'?[pl1[j]]:pl1[j];
                const a2=typeof pl2[j]=='number'?[pl2[j]]:pl2[j];
                const pl=plAnd(a1,a2,i);
                if (pl.length) {
                    out[j]=pl.length===1?pl[0]:pl;
                }
            }
        }
    }
    console.timeEnd('phrase')
    // console.log(getCounter())
    return out;
};

export default {phraseQuery};