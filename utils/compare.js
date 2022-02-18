import {removeHeader,removeBold,spacify} from './breaker.js';
import {diffSim} from './diff.js';
import {diffChars, diffWords} from 'diff'

export const compareText=(F1,F2,minsim=0.9)=>{
    const out=[];
    if (F1.length!==F2.length) {
        throw `line count unmatch f1:${F1.length} f2:${F2.length}`
    }
    for (let i=0;i<F1.length;i++) {
        const l1=spacify(removeBold(removeHeader(F1[i]))).replace(/ +/g,'');
        const l2=spacify(removeBold(removeHeader(F2[i]))).replace(/ +/g,'');
        const D=diffChars(l1,l2);
        const sim=diffSim(D);
        if(sim<minsim) {
            if (i==4554) console.log(l1,l2)
            out.push([i,sim,F1[i],F2[i]] );
        }
    }
    return out;
}

export default {compareText};