import {plAnd} from './posting.js';
export const phraseQuery=async (ptk,phrase)=>{
    const tokens=await ptk.prepareToken(phrase);
    
    let out=tokens[0].posting;
    
    for (let i=1;i<tokens.length;i++) {
        let pl1=out;       
        out=[];
        const pl2=tokens[i].posting;
        for (let j=0;j<pl1.length;j++) {
            if (pl1[j] && pl2[j]) {
                const a1=typeof pl1[j]=='number'?[pl1[j]]:pl1[j];
                const a2=typeof pl2[j]=='number'?[pl2[j]]:pl2[j];
                
                const pl=plAnd(a1,a2,i);
                if (pl.length)out[j]=pl;
            }
        }
    }
    return out;
};

export default {phraseQuery};