import { LOCATORSEP } from '../platform/constants.js';
import { removeSentenceBreak } from './breaker.js';
export const toParagraphs=(L,opts={})=>{
    const out=[];
    let lines=[],pid='';
    const unbreak=opts.unbreak||false;
    const bkpf=(opts.bkid||'').replace(/\..+$/,'');
    for (let i=0;i<L.length;i++) {
        if (L[i].indexOf('^n')>-1 && L[i].substr(0,3)!=='^n ') {
            const id=L[i].match(/\^n([\d\-]+)/);
            if (!id) {
                console.log(L[i])
            }
            if (pid) {
                out.push([pid,unbreak?removeSentenceBreak(lines):lines]);
                lines=[];        
            }
            pid=(bkpf?bkpf+LOCATORSEP:'')+id[1];
        }
        lines.push(L[i])
    }
    out.push([pid,unbreak?removeSentenceBreak(lines):lines]);
    return out;
}
export const autoAlign=(f1,f2,splitter=null)=>{
    //prerequisite
    //f1 and f2 need ^n marker
    //f2 has more lines than f1
    //for each paragraph, let f1 has same sentence as f2
    console.log(f1.length,f2.length)
}

export default {autoAlign,toParagraphs};