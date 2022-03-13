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
import { readTextLines, readTextContent } from "../platform/fsutils.js"
import {buildPitaka} from './build.js'
import {info} from './info.js';
import quote from './quote.js';
import iast from './provident.js';
import longline from './longline.js';
import dictwords from './dictwords.js';
import pinpoint from './pinpoint.js';
import {pin} from './pin-brk.js';
import nGram from '../fulltext/ngram.js';
import {compareText} from '../align/compare.js';
import {group,entrysort,search,wordseg,intersect} from './offtextutils.js'
import {autoAlign} from '../align/align.js'
import validate from "./validate.js"
import { writeChanged } from './index.js';
let pitakajson='pitaka.json';
let config={};
if (fs.existsSync(process.argv[3]) && process.argv[3].indexOf('.json')>0 ) {
    pitakajson=process.argv[3];
}
if (!fs.existsSync(pitakajson) ){
    console.log(red("missing pitaka.json"));
}
config=JSON.parse(readTextContent(pitakajson));
console.log('using',pitakajson);


const ptk=()=>_build({jsonp:false}); //build ptk (a zip file)
const build=()=>_build({jsonp:true});
const raw=()=>{
    if (process.argv[3]) {
        console.log('override files',config.files,'to',process.argv[3])
        config.files=process.argv[3]
    }
    _build({raw:true, files:process.argv[2]});
}
const ngram=()=>_build( {ngram:parseInt(arg)||2});
const exec=config=>{
    const jsfn=process.argv[3];
    if (!fs.existsSync(jsfn)) {
        console.log('missing js file');
        return;
    }
    let dir=process.cwd();
    const f='file://'+dir+Path.sep +jsfn;
    import(f).then(cb=>{
        _build({exec:cb});
    });
}
const compare=()=>{
    const f1=process.argv[3];
    const f2=process.argv[4];
    if (!f1) throw "missing file 1"
    if (!f2) throw "missing file 2"
    const F1=readTextLines(f1);
    const F2=readTextLines(f2);
    console.log(F1.length,F2.length)
    const diffs=compareText(F1,F2,{min:0.93,longLength:20,ignoreBlank:true,ignorePeyyala:true});
    console.log(JSON.stringify(diffs,'',' '))
    console.log("difference count",diffs.length)
}
const defaultGuideFolder='../cs/';
const align=()=>{
    let f1=process.argv[3];
    let f2=process.argv[4];
    if (!f1) throw "missing file 1"
    if (!f2) {
        f2=defaultGuideFolder+f1;
        if (!fs.existsSync(f2)) {
            throw "missing file 2 "
        }
    }
    const F1=readTextLines(f1);
    const F2=readTextLines(f2);

    const out=autoAlign(F1,F2);

    if (writeChanged(f1+'.aligned',out.join('\n'))) {
        console.log('written',f1+'.aligned')
    }
}

const report=(builder)=>{
    const {writer,files}=builder;
    const out=[], maxshow=5;
    if (builder.writerfile) out.push(yellow(' romfile   :')+writer.header.name+ROMEXT);
    else out.push(yellow(' folder    :')+writer.header.name);
    const showfile=files.slice(0,maxshow);
    out.push(' '+yellow((files.length+' files').padEnd(10,' ')+':')
      +showfile.join(',')
      +(files.length>maxshow?'...':''));
    out.push(yellow(' last text :')+writer.header.lastTextLine);
    out.push(yellow(' last line :')+writer.header.lineCount);
    out.push(yellow(' sections  :')+writer.header.sectionStarts.join('|') +' '+writer.header.sectionNames.join('|'));
    out.push(yellow(' max chunk :')+writer.header.chunkStarts.length.toString().padStart(3,'0')+'.js');
    out.push(yellow(' build time:')+writer.header.buildtime);
    
    
    return out.join('\n');
}

const _build=async (opts)=>{  
    console.time('pitaka');
    opts=opts||{raw:false,jsonp:false};
    if (!fs.existsSync(pitakajson)) {
        console.log(red('pitaka.json not found'));
        return; 
    }
    

    let ngram,onContent=null,nosave=false;

    if (opts.ngram) {
        nosave=true;
        let stockgram=null;

        if (opts.ngram>2) {
            stockgram={};
            const items=readTextLines('ngram-'+(opts.ngram-1)+'.txt');
            for (let i=0;i<items.length;i++) {
                const [gram,count]=items[i].split(',')
                stockgram[gram]=count;
            }
        }
        ngram=new nGram({gram:opts.ngram,stockgram});
        onContent=(fn,text)=>ngram.add(text)
    }
    if (opts.exec) nosave=true;

    const builder=await buildPitaka( {config,exec:opts.exec,nosave,onContent,raw:opts.raw,jsonp:opts.jsonp}  );

    if (ngram) {
        const s=ngram.dump();
        fs.writeFileSync('ngram-'+opts.ngram+'.txt',s.join('\n'),'utf8')
    }
    builder.finalized&&builder.log('\n'+report(builder));
    console.timeEnd('pitaka');
}

const help=()=>{
    console.log('Description: ')
    console.log(' Pitaka command line interface')
    console.log('\nUsage: ')
    console.log(yellow('$ pitaka build   '), 'build as jsonp')
    console.log(yellow('$ pitaka ptk   '), 'build rom file (.ptk)')
    console.log(yellow('$ pitaka raw [pat]'), 'create *-raw.off , may overwrite file pattern')
    console.log(yellow('$ pitaka ngram   '), 'get ngram, default 2')
    console.log(yellow('$ pitaka pin [pat]'), 'create a pin break file')
    console.log(yellow('$ pitaka align file file-sentenced  '), 'make file has same sentence, both need ^n marker')
    // console.log(yellow('$ pitaka info    '), 'show information of pitaka')
    // console.log(yellow('$ pitaka zip (regex)'), 'make a zip file')
    console.log(yellow('$ pitaka compare f1 f2'), 'compare two file, text only')
    console.log(yellow('$ pitaka validate'), 'validate all htm files')
    console.log(yellow('$ pitaka quote   '), 'extract quote from a ptk or offtext file')
    console.log(yellow('$ pitaka exec [.js] '), 'exec external js on every source file')
    console.log(yellow('$ pitaka pinpoint fn'), 'pinpoint a citation by quote and source book')
    console.log(yellow('$ pitaka group fn [pat]'), 'grouping string matching pattern, each line as item if no pat')
    console.log(yellow('$ pitaka entrYsort fn'), 'sort entry in unicode order')
    console.log(yellow('$ pitaka search fn'), 'search book/entry in pitaka file or a book list')
    console.log(yellow('$ pitaka longline fn'), 'find out long length')
    console.log(yellow('$ pitaka wordseg fn words/dict_ptk'), 'word segmentation')
    // console.log(yellow('$ pitaka intersect f1 f2'), 'intersect stringlist')
    console.log(yellow('$ pitaka iast fn'), 'convert IAST to provident')
    console.log(yellow('$ pitaka dictwords fn headword.txt'), 'words found in dictionary headword');
}

try {
    await ({v:validate,validate,
        build,b:build,raw,r:raw, ptk,q:quote,quote, pin, pinpoint,a:align,align,
        compare,c:compare,
        ngram,n:ngram,exec,e:exec,l:longline,longline,iast,
        group,g:group,entrysort,y:entrysort,search,s:search,wordseg,w:wordseg, dictwords,d:dictwords,
        '--help':help,'-h':help})[cmd](config,process.argv[3]);

} catch(e) {
    console.log( kluer.red('error running command'),cmd)
    console.log(e)
}
