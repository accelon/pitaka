import {removeHeader,removeVariantBold,spacify} from './breaker.js';
import {diffSim} from './diff.js';
import {diffChars, diffWords} from 'diff'
import { LOCATORSEP } from '../index.js';
export const compareText=(f1,f2,minsim=0.9)=>{
    const F1=fs.readFileSync(f1,'utf8').split(/\r?\n/);
    const F2=fs.readFileSync(f2,'utf8').split(/\r?\n/);
    const out=[];
    if (F1.length!==F2.length) {
        throw `line count unmatch f1:${F1.length} f2:${F2.length}`
    }
    for (let i=0;i<F1.length;i++) {
        const l1=spacify(removeVariantBold(removeHeader(F1[i]))).replace(/ +/g,'');
        const l2=spacify(removeVariantBold(removeHeader(F2[i]))).replace(/ +/g,'');
        const D=diffChars(l1,l2);
        const sim=diffSim(D);
        if(sim<minsim) {
            if (i==4554) console.log(l1,l2)
            out.push([i,sim,F1[i],F2[i]] );
        }
    }
    return out;
}
export const toParagraphs=(L,bkpf='')=>{
    const out=[];
    let lines=[],pid='';
    bkpf=bkpf.replace(/\..+$/,'');
    for (let i=0;i<L.length;i++) {
        if (L[i].indexOf('^n')>-1 && L[i].substr(0,3)!=='^n ') {
            const id=L[i].match(/\^n([\d\-]+)/);
            if (!id) {
                console.log(L[i])
            }
            if (pid) {
                out.push([pid,lines]);
                lines=[];        
            }
            pid=(bkpf?bkpf+LOCATORSEP:'')+id[1];
        }
        lines.push(L[i])
    }
    out.push([pid,lines]);
    return out;
}
export default {compareText,toParagraphs};