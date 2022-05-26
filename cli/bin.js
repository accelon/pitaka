#!/usr/bin/env node
/*
  Pitaka command line interface

  npx pitaka

*/
const cmd=process.argv[2] || '-h';
const arg=process.argv[3];
const arg2=process.argv[4];
import kluer from './kluer.js' //copy from https://github.com/lukeed/kleur/
const {blue,yellow,red,bgWhite} = kluer;
import nodefs from '../platform/nodefs.js';
await nodefs;
import { readTextLines, readTextContent } from "../platform/fsutils.js"
import {buildPitaka} from './build.js'
import {info} from './info.js';
import quote from './quote.js';
import {iast,provident} from './provident.js';
import longline from './longline.js';
import pinpoint from './pinpoint.js';
import {pin} from './pin-brk.js';
import nGram from '../search/ngram.js';
import EnumWordHead from '../search/enumwordhead.js';
import {compareText} from '../align/compare.js';
import {group,entrysort,search,wordseg,intersectFile} from './offtextutils.js'
import {autoAlign} from '../align/align.js'
import validate from "./validate.js"
import {lexemeOfSrcFiles} from "./lexeme.js"
import { writeChanged } from './index.js';
let pitakajson='pitaka.json';
let config={},task='builder';
if (fs.existsSync(arg) && arg.indexOf('.json')>0 ) {
    pitakajson=arg;
}
if (!fs.existsSync(pitakajson) ){
    console.log(red("missing pitaka.json"));
}
config=JSON.parse(readTextContent(pitakajson).replace(/\/\/ .+/g,''));
console.log('using',pitakajson);


const ptk=()=>_build({jsonp:false}); //build ptk (a zip file)
const build=()=>_build({jsonp:true});
const raw=()=>{
    if (arg) {
        console.log('override files',config.files,'to',arg)
        config.files=arg
    }
    _build({raw:true, files:process.argv[2]});
}
const ngram=()=>_build( {ngram:parseInt(arg)||2, lemma:arg2});
const wordhead=()=>_build({wordhead:arg||'hydcd3'})
const exec=config=>{
    const jsfn=arg;
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
    const f1=arg;
    const f2=arg2;
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
    let f1=arg;
    let f2=arg2;
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
    
   	builder.warnings.forEach( w=>{
   		if (typeof w==='string') out.push(red(w));
   		else out.push( red(w[0])+w.slice(1).join(' '));
   	});
    
    return out.join('\n');
}

const _build=async (opts)=>{  
    opts=opts||{raw:false,jsonp:false};
    if (!fs.existsSync(pitakajson)) {
        console.log(red('pitaka.json not found'));
        return; 
    }

    let tasker,onContent=null,nosave=false;

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
        let lemma;
        if (opts.lemma) {
            lemma=readTextLines( opts.lemma );
        }
        tasker=new nGram({gram:opts.ngram,stockgram,lemma});
        onContent=(fn,text)=>tasker.add(text);
        task='ngram '+opts.ngram;
        
    } else if (opts.exec) {
    	nosave=true;
    	task='exec';
    } else if (opts.raw) {
    	task='raw';
	} else if (opts.wordhead) {
        nosave=true;
        const lexicon=readTextLines( '../'+opts.wordhead+'/wordhead.txt'||arg);
        tasker=new EnumWordHead({lexicon});
        onContent=(fn,text)=>tasker.add(text,fn);
        task='wordhead in '+opts.wordhead;
    }
    console.time(task);

    const builder=await buildPitaka( {config,exec:opts.exec,nosave,onContent,raw:opts.raw,jsonp:opts.jsonp}  );

    if (tasker) {
        const {filename,result}=tasker.dump();
        if (writeChanged( filename ,result.join('\n'))) {
            console.log('written',filename,result.length);
        }
    }
    builder.finalized&&builder.log(report(builder));
    if (builder.inverter) {
    	console.log('inverter',builder.inverter.report);
    }
    console.timeEnd(task);
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
    console.log(yellow('$ pitaka info    '), 'show information of pitaka')
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
    console.log(yellow('$ pitaka provident fn'), 'convert provident to IAST')
    console.log(yellow('$ pitaka wordhead lexicon'), 'enum word head in lexicon=hydzd3');
    console.log(yellow('$ pitaka lexeme'), 'generate lexemes');
}

try {
    await ({v:validate,validate,
        build,b:build,raw,r:raw, ptk,q:quote,quote, pin, pinpoint,a:align,align,
        compare,c:compare,lexeme:lexemeOfSrcFiles,info,
        ngram,n:ngram,exec,e:exec,l:longline,longline,iast,provident,
        group,g:group,entrysort,y:entrysort,search,s:search,wordseg,w:wordseg, wordhead,
        '--help':help,'-h':help})[cmd](config,arg);

} catch(e) {
    console.log( kluer.red('error running command'),cmd)
    console.log(e)
}
