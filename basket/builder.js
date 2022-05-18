import {fileContent, removeLabels} from '../format/index.js'
import JSONPROMWriter from '../jsonprom/jsonpromw.js';
import Inverter from '../search/inverter.js';
import {serializeLabels,serializeLineposString,serializeNotes,serializeLemma,packNotes} from './serializer.js';
import {linesOffset} from '../utils/index.js'
import { initPitakaJSON ,initLabelTypedef } from './config.js';
import { LOCATORSEP } from '../platform/constants.js';
import {parseOfftextHeadings} from '../offtext/parser.js';
import { readTextContent } from '../platform/fsutils.js';
class Builder {
    constructor(opts) {
        this.context={
            eudc:{}//eudc found
            ,EUDC:null    //external eudc mapping
            ,errata:{}  
            ,catalog:{} 
            ,transclusion:{} //resolved translcusion
            ,nchapter:0,rawtags:[] 
            ,filename:'',ptkline:0
            ,entry:'' //dictionary entry
            ,startY:0// starting Y of this content
            ,lineCount:0 //y0 at the end of parsing content
            ,prevLineCount:0 //line count of previously parsed content
            ,labeldefs:null
            ,rawContent:null //e.g xml before parsing
            ,headings:[]     //header extract from bodytext, to speed up header search
            ,notes:[]       //multi-purpose trait , group by line
            ,closest:{}     //closest label
            ,lemma:null     // 詞表
        };
        this.writer=new JSONPROMWriter(Object.assign({},opts,{context:this.context}));
        this.finalized=false;
        this.log=opts.log || console.log;
        this.config=opts.config;

        if (this.config.fulltextsearch) {
            this.inverter=new Inverter(Object.assign({},opts,{context:this.context}));
        }

        //.tree is old name
        this.config.locator=this.config.locator||this.config.tree;
        if (typeof this.config.locator==='string') this.config.locator=this.config.locator.split(LOCATORSEP);
        
        this.opts=opts;
        this.exec=opts.exec;
        this.unknownLabel={};

        initPitakaJSON(this.config,this.context,this.log);
        initLabelTypedef(this.config,this.context,this.log);
        this.files=[];
        return this;
    }

    async addLst(lstfile) { //only support by nodejs, mainly for cbeta
        if (!fs.existsSync(lstfile)) {
            if (!this.config.allowmissingfile) this.log('missing file',lstfile);
            else return;
        }
        const files=(await fs.promises.readFile(lstfile,'utf8')).split(/\r?\n/);
        for (let i=0;i<files.length;i++) {
            let fn=files[i];
            if (fs.existsSync(fn)) {
                await this.addFile(fn);
            } else if (this.config.rootdir){
                fn=this.config.rootdir+files[i];
                if (fs.existsSync(fn)) {
                    await this.addFile(fn);
                } else {
                    throw "file not found"+fn
                }
                
            }
        }
    }
    adjustChapter(files){
        let out=[],touch=false;
        for (let i=0;i<files.length;i++) {
            const fn=files[i];
            const newpos=this.context.errata['*'+fn]
            if (typeof newpos==='number') {
                out.splice(newpos,0,fn);
                touch=true;
            } else {
                out.push(fn);
            }
        }
        return out;
    }
    doTags(tags,text){
        for (let i=0;i<tags.length;i++) {
            const tag=tags[i];
            const labeltype=this.context.labeldefs[tag.name];
            const linetext=text[tag.y - this.context.ptkline ];
            if (labeltype) {
                const D=this.context.labeldefs;
                labeltype.action(tag,linetext,this.context);
                if (labeltype.resets) {//fill by "reset" of child
                    labeltype.resets.forEach(r=>D[r]&&D[r].reseting(tag));
                }
                //may use label type name or label name to access closest tag
                this.context.closest[labeltype.constructor.name]=tag; //previous  , faster but doesn't allow label with same type
                this.context.closest[tag.name]=tag; //use labelutils.js::labelByTypeName to get the label
            } else {
                if (!this.unknownLabel[tag.name]) {
                    this.log('undefined tag',this.context.filename,tag.name, tag.y,linetext);
                    this.unknownLabel[tag.name]=1;
                } else this.unknownLabel[tag.name]++;
            }
        }
    }
    async addContent(rawcontent,fn) {
        //for multiple content, keep starting
        this.context.startY+=this.context.prevLineCount;
        this.context.filename=fn;
        this.context.ptkline=this.writer.header.lineCount; //ptk line count
        try{
            rawcontent=removeLabels(rawcontent,this.config.removeLabels);
            const {writertext,text,tags,headings}=parseOfftextHeadings(rawcontent,this.context.ptkline,this.config.locator);
            this.context.headings.push(...headings);

            this.context.linesOffset=linesOffset(text);
            this.context.lineCount=text.length;            
            if (this.exec) {
                const {onContent,onRawContent}= this.exec;
                if(onRawContent) await onRawContent(fn,rawcontent,this.context);
                if(onContent) await onContent(fn,text,tags,this.context)
            } else {
                if (this.opts.onContent) {
                    await this.opts.onContent(fn,text,tags,this.context);
                } else {
                    this.doTags(tags,text);
                    if (this.config.fulltextsearch) this.inverter.append(writertext);
                    this.writer.append(this.opts.raw?rawcontent:writertext);
                }    
            }
            this.context.prevLineCount=text.length;
        } catch(e){
            const {filename,fileline,title}=this.context;
            this.log( filename+'('+fileline+'):' , title, e );
            throw '';
        }
    }
    async addFolder(folder) {
        const files=fs.readdirSync((this.config.rootdir||'')+folder);
        for (let i=0;i<files.length;i++){
            process.stdout.write('\r'+files[i]+'        ');
            const fn=folder+'/'+ files[i];
            if (!(fn.endsWith('.xml') || fn.endsWith('.off') ||fn.endsWith('.txt'))) {
                console.log('skip',fn);
                continue;
            }
            await this.addFile((this.config.rootdir||'')+fn) ;
        }
    }
    addNotes(fn){
        let out='';
        const notefn=fn.replace(/[^\.]+\.off/g,'notes.json');
        if (fs.existsSync(notefn)) {
            try {
                out=JSON.parse(readTextContent(notefn));
            } catch (err) {
                console.error(err);
            }
        }
        packNotes(out,this.context);
    }
    async addFile(file){ //file=='string' nodejs , File browser local file, or a File in zip
        let fn=file;
        if (this.finalized) {
            this.log("cannot addFile, finalized");
            return;
        }
        let rawcontent=null;
        if (typeof file!=='string' && 'name' in file) {
            fn=file.name;
        }
        let rootdir='';
        if (typeof fs!=='undefined') {
            rootdir=this.config.rootdir||'off/';
        }
        if (fn.endsWith('.zip')) {
            throw "not support zip file"
            //return await this.addZip(file);
        } else if (fn.endsWith('.lst')) {
            return await this.addLst(file);
        } else if (typeof fs!=='undefined' && rootdir){
            if (fs.existsSync(rootdir+fn)&&fs.statSync(rootdir+fn).isDirectory()) {
                return await this.addFolder(file);
            } else if (!fs.existsSync(fn) &&fs.existsSync(rootdir+fn)) {
               rawcontent=await fileContent(rootdir+fn,this.context);

            }
        }
        if (!rawcontent) {
            rawcontent=await fileContent(file,this.context);
        }
        await this.addContent(rawcontent,fn);
        if (typeof fs!=='undefined' && rootdir) this.addNotes(rootdir+fn,this.context);
        // console.log(fn,this.context.startY,this.context.startY-py,rawcontent.split('\n').length)
    }
    save(opts){
        if (!this.finalized) {
            this.log('not finalized');
            return;
        }
        return this.writer.save(opts,this.config);
    }
    finalize(opts={}){
        this.context.lastTextLine=this.writer.setEndOfText();
        if (!opts.raw && !opts.exec) {

            if (this.config.fulltextsearch) {
                this.writer.addSection('inverted',true);
                const inverted=this.inverter.serialize();
                this.writer.append(inverted,true); //force new chunk                
            }
            if (this.context.headings.length) {
                this.writer.addSection('headings');
                const headings=serializeLineposString(this.context.headings);
                this.writer.append(headings);
            }
            if (this.context.lemma) {
                this.writer.addSection('lemma');
                const lemma=serializeLemma(this.context.lemma);
                this.writer.append(lemma);
            }

            this.writer.addSection('labels');
            const section=serializeLabels(this.context);
            this.writer.append(section);

            if (this.context.notes.length) {
                this.writer.addSection('notes');
                const trait=serializeNotes(this.context);
                 this.writer.append(trait);
            }
        }
        if (opts.exec && opts.exec.onFinalize) {
            opts.exec.onFinalize(opts);
        }

        // console.log('memory usage',process.memoryUsage())
        this.finalized=true;
        return this.context;
    }
}

export default Builder;