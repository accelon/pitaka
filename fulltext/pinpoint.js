import {fetchLoc} from 'pitaka';
import { makeHook } from '../offtext/hook.js';
import {extractChineseNumber} from '../utils/cnumber.js';
import {similarity} from './similarity.js'

export const fuzzyMatchPhrase=async (loc,quote)=>{
    let sim,hook,error='';
    const [ptk,content]=await fetchLoc(loc,1);
    if (!content) {
        return {error:'wrong loc '+loc}
    }
    for (let i=0;i<content.length;i++) {
        const res=pinpointPhrase(content[i][1],quote);
        if (res && res.sim>0.8) {
            return {ptk,y:content[i][0],hook:res.hook,sim:res.sim}
        }
    }
    return {error:'no match'};
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
