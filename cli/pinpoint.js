const quotefile=process.argv[3];
const ptkname=process.argv[4];

import {loadOfftextChunk} from '../offtext/chunker.js'
import {existsSync, fstat, readFileSync, writeFileSync} from 'fs';
import { locatePhrase ,fuzzyMatchPhrase} from '../fulltext/pinpoint.js'
import { openBasket, PATHSEP, useBasket } from '../index.js';

export default async function(){
    if (!quotefile || !ptkname) {
        console.log('pitaka p quote.off pitaka');
        return;
    }
    if (!existsSync(quotefile)) {
        console.log('quote not found',quotefile);
        return;
    }
    if (!ptkname) {
        console.log('missing pitaka');
        return;
    }

    const ptk=await openBasket(ptkname)
    const lines=readFileSync(quotefile,'utf8').trim().split(/\r?\n/);
    let hit=0,total=0;
    for (let i=0;i<lines.length;i++) {
        let line=lines[i],quotes=[];
        line.replace(/\^q\[loc=([^\]]+)\]：「([^」]+)」/g,(m,loc,quote,offset)=>{
            quotes.push([loc,quote,m.length,offset])
        });
        for (let j=quotes.length-1;j>=0;j--) {
            const [ loc,quote,len,offset]=quotes[j];
            const {ptk,sim,error,hook,y}=await fuzzyMatchPhrase(loc,quote);
            if (hook) {
                const addr='@'+PATHSEP+ptk+PATHSEP+useBasket(ptk).pageAt(y,true)+hook;
                line=line.substr(0,offset)+'^t['+addr+line.substr(offset+3+loc.length+4);
            }
        }
        if (quotes.length) total++;
        if (quotes.length&&line!==lines[i]) {
            lines[i]=line;
            hit++;
        }
    }
    console.log('total',total,'hit',hit);
    fs.writeFileSync(quotefile+'.pinpoint',lines.join('\n'),'utf8')  
}
