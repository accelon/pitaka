export const scoreRange=(weightedToken, plRange)=>{

    //a little bit faster than deconstruction inside loop
    const scores=weightedToken.map(it=>it[1]);
    const PL=weightedToken.map(it=>it[2]);
    const ptr=new Array(weightedToken.length);
    ptr.fill(0);
    let out=[],i=0;
    while (i<plRange.length-1) {
        let rangescore=0,nearest=plRange[plRange.length-1];
        const from=plRange[i], to=plRange[i+1];
        for (let j=0;j<PL.length;j++) {
            const pl=PL[j];
            let v=pl[ptr[j]];
            while (v<from&&ptr[j]<pl.length) {
                ptr[j]++
                v=pl[ptr[j]];
            }
            if (v>=from&&v<to) {
                rangescore+=scores[j];
            }
            if (nearest>v) nearest=v;
        }
        if (rangescore>0.7) out.push([i+1,rangescore]);//y is 1 base
        i++;
        while (nearest>plRange[i+1]) i++;
    }
    return out.sort((a,b)=>b[1]-a[1]);
}
export const convolute=(weightedToken,len,from,to)=>{
    const out=[]
    console.log(from,to)
    const ptr=new Array(weightedToken.length);
    ptr.fill(0);
    for (let i=from;i<to;i++) {
        let segmentscore=0;
        for (let j=0;j<weightedToken.length;j++) {
            const [tk,score,pl]=weightedToken[j];
            let v=pl[ptr[j]];
            while (v<from&&ptr[j]<pl.length) {
                ptr[j]++
                v=pl[ptr[j]]; 
            }
            if (v>=i&&v<i+len) {
                segmentscore+=score;
            }
        }
        out.push([i,segmentscore]);
    }
    out.sort((a,b)=>b[1]-a[1]);
    console.log(out.slice(0,5))
    return out.length?out[0][0]:from;
}
export default {scoreRange,convolute};