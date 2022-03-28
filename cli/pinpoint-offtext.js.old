const quotefile=process.argv[3];
const offtext=process.argv[4];

import {loadOfftextChunk} from '../offtext/chunker.js'
import {existsSync, readFileSync, writeFileSync} from 'fs';
import { locatePhrase } from '../fulltext/pinpoint.js'

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
    const matches={},unpassed=[];
    let passed=0
    const quotes=readFileSync(quotefile,'utf8').trim().split(/\r?\n/);

    for (let i=0;i<quotes.length;i++) {
        let [wh,line,q]=quotes[i].split(',');
        q=q.replace(/　/g,'');
        const bkid=quotefile.match(/(\d+)/)[1]
        const res=locatePhrase(q,chunks,bkid);
        if (res.error) {
            if (res.error=='chapter not found') {
                console.log(q)
            }
            // console.log(res)
        } else {
            if (res.t.indexOf(wh)==-1 && res.sim<0.8) {
                unpassed.push('"'+wh+'\t'+'":"'+line+res.target+'",//'+res.t+' '+res.sim);
            //    console.log("source text doesn't include wh ",res.t,wh)
            } else {
                passed++;
                if (!matches[wh]) matches[wh]=[];
                matches[wh].push(line+'^'+res.target);
            }
           
        }
    }
    console.log('all quotes',quotes.length,'pass',passed,)
    writeFileSync(quotefile.replace('.txt','.js'),'export default '+JSON.stringify(matches,'',' '),'utf8');

    writeFileSync(quotefile.replace('.txt','.failed'),'export default {'+unpassed.join(',\n')+'}','utf8');
}
