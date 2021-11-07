
import {existsSync, fstat, readFileSync, writeFileSync} from 'fs';
import { locatePhrase ,fuzzyMatchQuote} from '../fulltext/pinpoint.js'
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

    const lines=readFileSync(quotefile,'utf8').trim().split(/\r?\n/);
    let hit=0,total=0;
    for (let i=0;i<lines.length;i++) {
        let line=lines[i],quotes=[];
        
        line.replace(/《([^》]+)》：「([^」]+)」/g,(m,bookchapter,quote,offset)=>{
            const bkcp=bookchapter.split('．');
            const bkname=bkcp[0];
            let chapter=0;
            if (bkcp[1]) chapter=extractChineseNumber(bkcp[1]);
            const bkobj=Booknames[bkname];
            if (bkobj) {
                quotes.push([bkobj,chapter,quote,m.length,offset,bookchapter.length+4])
            }
        });

        if (!quotes.length) continue;
        for (let j=quotes.length-1;j>=0;j--) {
            const [ bkobj,chapter,quote,qlen,offset,bkchlen]=quotes[j];
            const {sim,error,hook,y}=await fuzzyMatchQuote(bkobj,quote);


            
            //const {ptkname,sim,error,hook,y}=await fuzzyMatchQuote(loc,quote);
            if (hook) {
                const addr='@'+PATHSEP+bkobj.ptk.name+PATHSEP+bkobj.ptk.pageAt(y,true)+hook+']';
                // const loc=bkobj.ptk.locate(y).join(PATHSEP);
                line=line.substr(2,offset+bkchlen-4)+'^t['+addr+line.substr(offset+bkchlen-1);
            }
            
        }
        total+=quotes.length;
        if(line!==lines[i]) {
            lines[i]=line;
            hit++;
        }
        process.stdout.write( '\r'+hit+'/'+total+'     ');
    }
    console.log('total',total,'hit',hit);
    // fs.writeFileSync(quotefile+'.pinpoint',lines.join('\n'),'utf8')  
}
