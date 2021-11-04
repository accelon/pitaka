import {plFind} from './posting.js'
export const scoreRange=(weightedToken, plRange)=>{
    const out=[];
    let i=0;
    while (i<plRange.length-1) {
        let rangescore=0,nearest=Number.MAX_SAFE_INTEGER;
        const from=plRange[i], to=plRange[i+1];
        for (let j=0;j<weightedToken.length;j++) {
            const [tk,score,pl]=weightedToken[j];
            const start=plFind(pl,from);
            if (pl[start]>to) {
                if (nearest>pl[start]) {
                    nearest=pl[start]
                }
                continue;
            }
            let end=start;
            while (pl[end]<to && end<pl.length) {
                end++;
                break;
            }
            if (end>start) {
                rangescore+=score;
            }
            
        }
        if (rangescore>0.6) out.push([i+1,parseFloat(rangescore.toFixed(3))]);
        const j=plFind(plRange , nearest, i)
        if (j>i+1) {
            i=j-1;
        } else {
            i++;
        }
    }
    out.sort((a,b)=>b[1]-a[1])
    return out;
}

export default {scoreRange};