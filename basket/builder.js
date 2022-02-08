import {getFormatter, getZipIndex, getFormatLocator, fileContent, removeLabels} from '../format/index.js'
import JSONPROMWriter from '../jsonprom/jsonpromw.js';
import Inverter from '../fulltext/inverter.js';
import {serializeLabels,serializeBreakpos} from './serializer.js';
import {linesOffset} from '../utils/index.js'
import { initPitakaJSON } from './config.js';
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
        };
        this.writer=new JSONPROMWriter(Object.assign({},opts,{context:this.context}));
        this.inverter=new Inverter(Object.assign({},opts,{context:this.context}));
        this.finalized=false;
        this.log=opts.log || console.log;
        this.config=opts.config;
        //.tree is old name
        this.config.locator=this.config.locator||this.config.tree||getFormatLocator(this.config.format);
        this.opts=opts;
        this.exec=opts.exec;
        this.unknownLabel={};

        initPitakaJSON(this.config,this.context,this.log);
        this.files=[];
        return this;
    }

    async addLst(lstfile,format) { //only support by nodejs, mainly for cbeta
        if (!fs.existsSync(lstfile)) {
            if (!this.config.allowmissingfile) this.log('missing file',lstfile);
            else return;
        }
        const files=(await fs.promises.readFile(lstfile,'utf8')).split(/\r?\n/);
        for (let i=0;i<files.length;i++) {
            let fn=files[i];
            if (fs.existsSync(fn)) {
                await this.addFile(fn,format);
            } else if (this.config.rootdir){
                fn=this.config.rootdir+files[i];
                if (fs.existsSync(fn)) {
                    await this.addFile(fn,format);
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
        // if (touch) console.log(out)
        return out;
    }
    async addZip(file,format){
        let fn=file;       
        if (typeof file!=='string' && 'name' in file) {
            fn=file.name;
        }
        const jszip=new lazip.JSZip();
        let zip;
        if (typeof file=='string') {
            fn=(this.config.rootdir||'')+file;
            if (!fs.existsSync(fn)) {
                if (!this.config.allowmissingfile) this.log('missing file',fn);
                else return;
            }
            const data=await fs.promises.readFile(fn);
            zip=await jszip.loadAsync(data);
        } else {
            zip=await jszip.loadAsync(file.getFile());
        }
        this.context.error=0;
        let {files,tocpage}=await getZipIndex(zip,format,fn); //pitaka not using tocpage
        
        if (this.context.errata) files=this.adjustChapter(files);

        const jobs=[];
        const contents=new Array(files.length); //save the contents in order
        const rawContents=new Array(files.length);

        for (let i=0;i<files.length;i++) {
            jobs.push(new Promise( async resolve=>{
                const c=await fileContent({name:files[i],zip},format,this.context);
                contents[i]=c;
                rawContents[i]=this.context.rawContent;  //backup the rawcontent
                resolve();
            }));
        }
        await Promise.all(jobs);
        if (tocpage.length) {
            this.context.rawContent=rawContents[i]; //get the rawcontent back
            await this.addContent([tocpage[0]],'offtext','index.html');//only take the bookname
        }
        for (let i=0;i<files.length;i++) {
            this.context.rawContent=rawContents[i];
            await this.addContent(contents[i], format, files[i]);
        }
        if (this.context.error) this.log(fn,'has',this.context.error,'errors')
    }
    doTags(tags,text){
        for (let i=0;i<tags.length;i++) {
            const tag=tags[i];
            const labeltype=this.context.labeldefs[tag.name];
            const linetext=text[tag.y - this.context.ptkline ];
            if (labeltype) {
                labeltype.action(tag,linetext,this.context);
                if (labeltype.resets) {
                    const D=this.context.labeldefs;
                    if (typeof labeltype.resets==='string') {
                        D[labeltype.resets].reset(tag);
                    } else {
                        labeltype.resets.forEach(r=>D[r]&&D[r].reset(tag));
                    }
                }
            } else {
                if (!this.unknownLabel[tag.name]) {
                    this.log('undefined tag',this.context.filename,tag.name, tag.y, linetext);
                    this.unknownLabel[tag.name]=1;
                } else this.unknownLabel[tag.name]++;
            }
        }
    }
    async addContent(rawcontent,format,fn) {
        //for multiple content, keep starting
        this.context.startY+=this.context.prevLineCount;
        this.context.filename=fn;
        this.context.ptkline=this.writer.header.lineCount; //ptk line count
        try{
            const Formatter=getFormatter(format);
            const formatter=new Formatter(this.context,this.log);
            const converted=fn.endsWith('.off');
            rawcontent=removeLabels(rawcontent,this.config.removeLabels);
            const {text,tags,rawtext}=formatter.scan(rawcontent,converted);

            this.context.linesOffset=linesOffset(text);
            this.context.rawlinesOffset=linesOffset(rawtext);
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
                    if (!this.config.textOnly) this.inverter.append(rawtext);
                    this.writer.append(rawtext);
                }    
            }
            this.context.prevLineCount=text.length;
        } catch(e){
            const {filename,fileline,title}=this.context;
            this.log( filename+'('+fileline+'):' , title, e );
            throw '';
        }
    }
    async addFolder(folder,format) {
        const files=fs.readdirSync((this.config.rootdir||'')+folder);
        for (let i=0;i<files.length;i++){
            process.stdout.write('\r'+files[i]+'        ');
            const fn=folder+'/'+ files[i];
            if (!(fn.endsWith('.xml') || fn.endsWith('.off') ||fn.endsWith('.txt'))) {
                console.log('skip',fn);
                continue;
            }
            await this.addFile((this.config.rootdir||'')+fn,format) ;
        }
    }
    async addFile(file,format){ //file=='string' nodejs , File browser local file, or a File in zip
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
        if (typeof fs!=='undefined' && this.config.rootdir) {
            rootdir=this.config.rootdir||'';
        }
        if (fn.endsWith('.zip')) {
            return await this.addZip(file,format);
        } else if (fn.endsWith('.lst')) {
            return await this.addLst(file,format);
        } else if (typeof fs!=='undefined' && rootdir){
 
            if (fs.existsSync(rootdir+fn)&&fs.statSync(rootdir+fn).isDirectory()) {
            // console.log('is folder',fn)
                return await this.addFolder(file,format);
            } else if (!fs.existsSync(fn) &&fs.existsSync(rootdir+fn)) {
               rawcontent=await fileContent(rootdir+fn,format,this.context);
            }
        }

        if (!rawcontent) rawcontent=await fileContent(file,format,this.context);
        await this.addContent(rawcontent,format,fn);
    }
    save(opts){
        console.log('saving file')
        if (!this.finalized) {
            this.log('not finalized');
            return;
        }
        return this.writer.save(opts,this.config);
    }
    finalize(opts={}){
        this.context.lastTextLine=this.writer.setEndOfText();
        if (!opts.raw && !opts.exec) {
            this.writer.addSection('inverted',true);                
            const inverted=this.inverter.serialize();
            this.writer.append(inverted,true); //force new chunk

            if (this.config.breakpos) {
                this.writer.addSection('breakpos');
                const section=serializeBreakpos(this.context);
                this.writer.append(section);    
            }

            console.log('finalizing labels')
            this.writer.addSection('labels');
            const section=serializeLabels(this.context);
            this.writer.append(section);
        }
        if (opts.exec && opts.exec.onFinalize) {
            opts.exec.onFinalize(opts);
        }

        console.log('memory usage',process.memoryUsage())
        this.finalized=true;
        return this.context;
    }
}

export default Builder;