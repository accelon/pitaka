
import {existsSync, fstat, readFileSync, writeFileSync} from 'fs';
import { locatePhrase ,fuzzyMatchQuote} from '../search/pinpoint.js'
import { openBasket, PATHSEP, useBasket } from '../index.js';
import {extractChineseNumber} from '../utils/index.js'

export default async function(config){
    const quotefile=process.argv[3]||config.files.split(',')[0];

    if (!existsSync(quotefile)) {
        console.log('quote not found',quotefile);
        return;
    }

    const ptks=(typeof config.connect==='string')?config.connect.split(','):config.connect;
    const Booknames={};
    for (let i=0;i<ptks.length;i++) {
        const ptk=await openBasket(ptks[i]);
        const bks=ptk.getBooks();
        bks.forEach(bk=>Booknames[bk.name]={...bk,ptk});
    }
    if (config.bookalias) {
        for (let abk in config.bookalias) {
            if (Booknames[config.bookalias[abk]]) {
                Booknames[abk]=Booknames[config.bookalias[abk]];
            }
        }
    }

    const lines=readFileSync(quotefile,'utf8').trim().split(/\r?\n/);
    let hit=0,total=0;
    for (let i=0;i<lines.length;i++) {
        let line=lines[i],quotes=[];
        
        line.replace(/《([^》]+)》([^「]+)「([^」]+)」/g,(m,bkch,extra,quote,offset)=>{
            const bkcp=bkch.split('．');
            const bkname=bkcp[0];
            let chapter=0;
            if (bkcp[1]) chapter=extractChineseNumber(bkcp[1]);
            const bkobj=Booknames[bkname];
            if (bkobj) {
                quotes.push([bkobj,chapter,quote,m.length,bkch,extra,offset])
            }
        });

        if (!quotes.length) continue;
        for (let j=quotes.length-1;j>=0;j--) {
            const [ bkobj,chapter,quote,qlen,bkch,extra,offset]=quotes[j];
            const {sim,error,hook,y}=await fuzzyMatchQuote(bkobj,quote);

            // if (chapter!==) warn 引用回數錯誤

            if (hook) {
                const insertat=offset+extra.length+bkch.length+2;
                const loc=bkobj.ptk.locOf(y);
                const addr='@'+PATHSEP+bkobj.ptk.name+PATHSEP+loc+hook+']';
                line=line.substr(0,insertat)+'^t['+addr+line.substr(insertat);
            }
        }
        total+=quotes.length;
        if(line!==lines[i]) {
            lines[i]=line;
            hit++;
        }
        if (total%32===0) process.stdout.write( '\r'+hit+'/'+total+ ' '+(hit/total).toFixed(3)+'     ');
    }
    console.log('total',total,'hit',hit);
    fs.writeFileSync(quotefile+'-pinpoint',lines.join('\n'),'utf8')  
}
