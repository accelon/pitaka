import {TK_WEIGHT, TK_NAME,TK_POSTING} from './tokenizer.js'


export const scoreRange=(weightedToken, plRange, opts)=>{
    //a little bit faster than deconstruction inside loop
    const scores=weightedToken.map(it=>it[TK_WEIGHT]);
    const PL=weightedToken.map(it=>it[TK_POSTING]);
    const ptr=new Array(weightedToken.length);
    opts=opts||{};

    const minscore=opts.minscore||0.7;
    const plRangeLast=plRange[plRange.length-1];
    ptr.fill(0);
    let out=[],i=opts.from||0, till=opts.to||plRange.length-1;
    while (i<till) {
        let rangescore=0,nearest=plRangeLast;
        const from=plRange[i], to=plRange[i+1];
        for (let j=0;j<PL.length;j++) {
            const pl=PL[j];
            let v=pl[ptr[j]];
            while (v<from&&ptr[j]<pl.length) {
                ptr[j]++
                v=pl[ptr[j]];
            }
            if (v>=from&&v<to) { 
                let score=scores[j];
                while (v>=from && v<to) {
                    rangescore+=score;
                    score/=4;  //重覆出現的效用遞減
                    ptr[j]++
                    v=pl[ptr[j]];
                }
            }
            if (nearest>v) nearest=v;
        }
        if (rangescore>=minscore) out.push([i+1,rangescore]);//y is 1 base
        i++;
        while (nearest>plRange[i+1]) i++;
    }
    out=out.sort((a,b)=>b[1]-a[1]);
    return out;
}
export const convolute=(weightedToken,len,from,to)=>{
    const out=[]
    const ptr=new Array(weightedToken.length);
    ptr.fill(0);
    for (let i=from;i<to;i++) {
        let segmentscore=0;
        for (let j=0;j<weightedToken.length;j++) {
            const score=weightedToken[j][TK_WEIGHT];
            const pl=weightedToken[j][TK_POSTING];
            let v=pl[ptr[j]];
            while (i>=v&&ptr[j]<pl.length) {
                ptr[j]++
                v=pl[ptr[j]]; 
            }
            if (v>=i&&v<i+len) {
                segmentscore+=score;
            }
        }
        if (segmentscore>0.7) out.push([i,segmentscore]);
    }
    out.sort((a,b)=>b[1]-a[1]);
    return out.length?out[0][0]:from;
}
export default {scoreRange,convolute};