import {extractChineseNumber} from '../utils/cnumber.js';
import {similarity} from './similarity.js'

export const locatePhrase=(quoteline,chunks)=>{
    
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

                return { y:'c'+chapter+':'+i, x:offset, z:t.length , t, sim}
            }
        }
    }
    return {error:' '}
}
