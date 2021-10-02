const quotefile=process.argv[3];
const offtext=process.argv[4];
import {extractChineseNumber} from '../utils/cnumber.js';
import {loadOfftextChunk} from '../offtext/chunker.js'
import {existsSync, readFileSync, writeFileSync} from 'fs';

export default async function(){
    if (!quotefile || !offtext) {
        console.log('pitaka q quote.txt source.off');
        return;
    }
    if (!existsSync(quotefile)) {
        console.log('quote not found',quotefile);
        return;
    }
    if (!existsSync(offtext)) {
        console.log('offtext not found',offtext);
        return;
    }

    const chunks=await loadOfftextChunk(offtext);
    const matches=[];
    const quotes=readFileSync(quotefile,'utf8').trim().split(/\r?\n/);
    for (let i=0;i<quotes.length;i++) {
        let [wh,line,q]=quotes[i].split(',');
        q=q.replace(/　/g,'');

        const chapter=extractChineseNumber(q);
        const m2=q.match(/「(.+)」/);
        if (!chapter || !m2) {
            // console.log("error no source",quotes[i],m2);
        } else {
            
            let qend=m2[1].replace(/[^\u3400-\u9fff]+$/,'');
            qend=qend.substr(qend.length-2)
            const qstart=m2[1].substr(0,2);
            const qlen=m2[1].length-4;
            const reg=new RegExp(  qstart+'.{'+(qlen-2) +','+(qlen+2)+'}'+qend);
            //console.log(chapter,qstart,qend)

            const srclines=chunks[chapter];
            if (!srclines) {
                console.log('error chapter',chapter);
                continue;
            }
            for (let i=0;i<srclines.length;i++) {
                const linetext=srclines[i];
                const m=linetext.match(reg);
                if (m) {
                    const offset=parseInt(m.index);
                    const st=linetext.substr(offset,m[0].length);
                    if (st.indexOf(wh)==-1) {
                        console.log("source text doesn't include wh",st,wh)
                    }
                    matches.push([wh,line,chapter,i,offset,st]);
                }
            }
        }
    }
    writeFileSync(quotefile+'.ok',matches.join('\n'),'utf8');
}
