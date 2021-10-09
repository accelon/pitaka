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
    const matches=[];
    let ok=0
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
            if (res.t.indexOf(wh)==-1) {
            //    console.log("source text doesn't include wh ",res.t,wh)
            } else {
                ok++;
            }
            matches.push( Object.assign({src:wh,dy:line},res) );
        }
    }
    console.log('ok',ok,'matches',matches.length,'all quotes',quotes.length)
    writeFileSync(quotefile+'.ok',matches.map(JSON.stringify).join('\n'),'utf8');
}
