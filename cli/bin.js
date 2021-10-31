#!/usr/bin/env node
/*
  Pitaka command line interface

  npx pitaka

*/
const cmd=process.argv[2] || '-h';
const arg=process.argv[3];
import kluer from './kluer.js' //copy from https://github.com/lukeed/kleur/
const {blue,yellow,red,bgWhite} = kluer;
import nodefs from '../platform/nodefs.js';
await nodefs;
import ltx from 'ltx'
global.XML=ltx;
import {existsSync,  readFileSync} from 'fs';
import {buildPitaka} from './build.js'
import {info} from './info.js';
import quote from './quote.js';
import pinpoint from './pinpoint.js';
import nGram from '../fulltext/ngram.js';
import {group,entrysort,search,wordseg} from './offtextutils.js'

import validate from "./validate.js"
import zip from "./zip.js"
const pitakajson='pitaka.json';

const jsonp=()=>build({jsonp:true});
const raw=()=>build({raw:true});
const ngram=()=>build( {ngram:parseInt(arg)||2});
const report=(builder)=>{
    const {writer,files}=builder;
    const out=[], maxshow=5;
    if (builder.writerfile) out.push(yellow(' romfile   :')+writer.header.name+ROMEXT);
    else out.push(yellow(' folder    :')+writer.header.name);
    const showfile=files.slice(0,maxshow);
    out.push(' '+yellow((files.length+' files').padEnd(10,' ')+':')
      +showfile.join(',')
      +(files.length>maxshow?'...':''));
    out.push(yellow(' last line :')+writer.header.lineCount);
    out.push(yellow(' max chunk :')+writer.header.chunkStarts.length.toString().padStart(3,'0')+'.js');
    out.push(yellow(' build time:')+writer.header.buildtime);
    
    return out.join('\n');
}

const build=async (opts)=>{  
    console.time('pitaka');
    opts=opts||{raw:false,jsonp:false};
    if (!existsSync(pitakajson)) {
        console.log(red('pitaka.json not found'));
        return; 
    }
    const config=JSON.parse(readFileSync(pitakajson,'utf8').trim());

    let ngram,onContent=null,nosave=false;

    if (opts.ngram) {
        nosave=true;
        let stockgram=null;

        if (opts.ngram>2) {
            stockgram={};
            const items=fs.readFileSync('ngram-'+(opts.ngram-1)+'.txt','utf8').split(/\r?\n/);
            for (let i=0;i<items.length;i++) {
                const [gram,count]=items[i].split(',')
                stockgram[gram]=count;
            }
        }
        ngram=new nGram({gram:opts.ngram,stockgram});
        onContent=(fn,text)=>ngram.add(text)
    }
    
    const builder=await buildPitaka( {config,nosave,onContent,raw:opts.raw,jsonp:opts.jsonp}  );

    if (ngram) {
        const s=ngram.dump();
        fs.writeFileSync('ngram-'+opts.ngram+'.txt',s.join('\n'),'utf8')
    }
    builder.log('\n'+report(builder));
    console.timeEnd('pitaka');
}

const help=()=>{
    console.log('Description: ')
    console.log(' Pitaka command line interface')
    console.log('\nUsage: ')
    console.log(yellow('$ pitaka build   '), 'build pitaka rom file')
    console.log(yellow('$ pitaka jsonp   '), 'build pitaka jsonp folder')
    console.log(yellow('$ pitaka raw     '), 'create *-raw.txt and *-raw.json')
    console.log(yellow('$ pitaka ngram   '), 'get ngram, default 2')
    console.log(yellow('$ pitaka info    '), 'show information of pitaka')
    console.log(yellow('$ pitaka zip (regex)'), 'make a zip file')
    console.log(yellow('$ pitaka validate'), 'validate all htm files')
    console.log(yellow('$ pitaka quote   '), 'extract quote from a ptk or offtext file')
    console.log(yellow('$ pitaka pinpoint fn ptk'), 'pinpoint a citation by quote and source book')
    console.log(yellow('$ pitaka group fn [pat]'), 'grouping string matching pattern, each line as item if no pat')
    console.log(yellow('$ pitaka entrysort fn'), 'sort entry in unicode order')
    console.log(yellow('$ pitaka search fn ptk'), 'search book/entry in pitaka file or a book list')
    console.log(yellow('$ pitaka wordseg fn words/dict_ptk'), 'word segmentation')
}

try {
    await ({v:validate,validate,
        j:jsonp,jsonp,raw,r:raw, q:quote,quote, p:pinpoint,pinpoint,
        z:zip,zip,ngram,n:ngram,
        group,g:group,entrysort,e:entrysort,search,s:search,wordseg,w:wordseg,
        '--help':help,'-h':help,i:info,info,build,b:build})[cmd]();

} catch(e) {
    console.log( kluer.red('error running command'),cmd)
    console.log(e)
}
