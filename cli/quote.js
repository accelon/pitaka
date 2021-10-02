const off=process.argv[3];
import {existsSync, writeFileSync} from 'fs';
import {loadOfftextChunk} from '../offtext/chunker.js'
/** 提取詞典中的引文，以詞條開始的相對行數定位 */
export default async function(){
    if (!off) {
        console.log('pitaka q source.off');
    }

    if (!existsSync(off)) {
        console.log('file not found',off);
        return;
    }
    const chunks=await loadOfftextChunk(off);
    
    const quotes=[];
    for (let key in chunks) {
        const lines=chunks[key];
        for (let i=0;i<lines.length;i++) {
            const line=lines[i];
            if (line.substr(0,3)=='^q ') {
                if (key&&key[0].trim()) quotes.push([key,(i+1),line.substr(3).replace(/,/g,'，')]);
            }
        }
    }
    const outfn=off.replace(".off","-quotes.txt");
    console.log('quotes count',quotes.length,outfn)
    writeFileSync(outfn,quotes.join('\n'),'utf8');
}