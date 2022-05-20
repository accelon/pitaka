import {fetchLoc} from 'pitaka';
import { makeHook } from '../align/pinpos.js';
import {extractChineseNumber} from '../utils/cnumber.js';
import {similarity} from './similarity.js'
import {diffCJK,printDiff,} from 'pitaka/utils' 
import {weightToken,scoreRange,convolute,CJKWordEnd_Reg} from '../search/index.js'


export const fuzzyMatchQuote=async (bkobj,q)=>{
    const {ptk,from,to}=bkobj;
    const tokens=(await ptk.prepareToken(q));
    const qlen=tokens.length*1.3;

    const weighted=weightToken(tokens) 

    const scores=scoreRange(weighted,ptk.inverted.linetokenpos,{from,to,minscore:0.8}).slice(0,3);
    
    await ptk.prefetchLines( scores.map(it=>it[0]) );

    for (let i=0;i<scores.length;i++) { 
        const y=scores[i][0];
        const src=ptk.getLine(y);   
        const from=ptk.inverted.linetokenpos[y-1],to=ptk.inverted.linetokenpos[y];
        const at=convolute(weighted,qlen,from,to);
    
        const x=at-from; 
        let [diff, adjx, adjw , sim]=diffCJK(q,src,x, q.length*1.5);//.filter(it=>q.length*2>it.value.length);
        
        if (adjw==0) continue; 

        while ( adjw>0 &&!src.substr(adjx,adjw).match(CJKWordEnd_Reg)) {
            adjw--;
        }
        const hook=makeHook(src,adjx,adjw);

        return {ptk,y,hook,sim, diff};
    }

    return {};
}

const pinpointPhrase=(linetext,q)=>{
    let qend=q.replace(/[^\u3400-\u9fff]+$/,'');
    qend=qend.substr(qend.length-2)
    const qstart=q.substr(0,2);
    const qlen=q.length-4;
    const reg=new RegExp(  qstart+'.{'+(qlen-5) +','+(qlen+5)+'}'+qend);
    const m=linetext.match(reg);
    if (m) {
        const offset=parseInt(m.index);
        const t=linetext.substr(offset,m[0].length);
        const sim=similarity(q,t);
        const hook=makeHook(linetext,offset,t.length);
        return { hook, t, sim}
    } else return null;
}
export const locatePhrase=(quoteline,chunks,bkid)=>{
    const chapter=extractChineseNumber(quoteline);
    const m2=quoteline.match(/「(.+)」/);
    if (!chapter || !m2) {
        return {error:'not a quote'};
    } else {
        const q=m2[1];
        let qend=q.replace(/[^\u3400-\u9fff]+$/,'');
        qend=qend.substr(qend.length-2)
        const qstart=q.substr(0,2);
        const qlen=q.length-2;
        const reg=new RegExp(  qstart+'.{'+(qlen-6) +','+(qlen+6)+'}'+qend);

        const srclines=chunks[chapter];
        if (!srclines) {
            return {error:'chapter not found'};
        }
        for (let i=0;i<srclines.length;i++) {
            const linetext=srclines[i];
            const m=linetext.match(reg);
            if (m) {
                const offset=parseInt(m.index);
                const t=linetext.substr(offset,m[0].length);
                const sim=similarity(q,t);
                const h=makeHook(linetext,offset,t.length);
                return { target: bkid+'/'+chapter+':'+(i+1)+'/'+h, t, sim}
            }
        }
    }
    return {error:' '}
}
