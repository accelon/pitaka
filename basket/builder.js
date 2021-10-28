import {getFormatter, getZipIndex, getFormatTypeDef, getFormatTree, fileContent} from '../format/index.js'
import JSONPROMWriter from '../jsonprom/jsonpromw.js';
import {serializeLabels} from './serialize-label.js';
import {linesOffset} from '../utils/index.js'
class Builder {
    constructor(opts) {
        this.context={
            eudc:{}//eudc found
            ,EUDC:null    //external eudc mapping
            ,errata:{}  
            ,catalog:{} 
            ,nchapter:0,rawtags:[] 
            ,filename:'',ptkline:0
            ,entry:'' //dictionary entry
            ,startY:0// starting Y of this content
            ,lineCount:0 //y0 at the end of parsing content
            ,prevLineCount:0 //line count of previously parsed content
            
        };
        this.writer=new JSONPROMWriter(Object.assign({},opts,{context:this.context}));
        this.finalized=false;
        this.log=opts.log || console.log;
        this.config=opts.config;
        this.config.tree=this.config.tree||getFormatTree(this.config.format);
        this.opts=opts;
        this.unknownLabel={};
        this.labeldefs=getFormatTypeDef(this.config,{context:this.context,log:this.log});
        this.files=[];
        if (this.config.eudc) this.addJSON(this.config.eudc,'EUDC');
        if (this.config.errata) this.addErrata(this.config.errata);
        if (this.config.catalog) this.addJSON(this.config.catalog,'catalog');
        return this;
    }
    addJSON(fn,key) {
        const self=this;
        fileContent(fn).then(content=>{
            self.context[key]=JSON.parse(content);
        });
    }
    addErrata(erratafile) {
        const self=this;
        fileContent(erratafile).then(content=>{
            const errata=JSON.parse(content);
            for (let fn in errata) {
                for (let i in errata[fn]) {
                    const [from,to,opts]=errata[fn][i];
                    if (opts===true) {
                        const regex=new RegExp(from,'g');
                        errata[fn][i]=[regex,to];
                    }
                    //todo opts is number, dec for each match
                }
            }
            self.context.errata=errata;
        });
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
    async addZip(file,format){
        let fn=file;       
        if (typeof file!=='string' && 'name' in file) {
            fn=file.name;
        }
        const jszip=new JSZip();
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
        const {files,tocpage}=await getZipIndex(zip,format,fn); //pitaka not using tocpage
        
        const jobs=[];
        const contents=new Array(files.length); //save the contents in order
        for (let i=0;i<files.length;i++) {
            jobs.push(new Promise( async resolve=>{
                const c=await fileContent({name:files[i],zip},format,this.context);
                contents[i]=c;
                resolve();
            }));
        }
        await Promise.all(jobs);
        if (tocpage.length) {
            this.addContent(tocpage[0],'offtext','index.html');//only take the bookname
        }
        for (let i=0;i<files.length;i++) {
            this.addContent(contents[i], format, files[i]);
        }
        if (this.context.error) this.log(fn,'has',this.context.error,'errors')
    }
    doTags(tags,text){
        for (let i=0;i<tags.length;i++) {
            const tag=tags[i];
            const labeltype=this.labeldefs[tag.name];
            if (labeltype) {
                const linetext=text[tag.y - this.context.ptkline ];
                labeltype.action(tag,linetext,this.context);
                if (labeltype.resets) {
                    const D=this.labeldefs;
                    labeltype.resets.forEach(r=>D[r]&&D[r].reset(tag));
                }
            } else {
                if (!this.unknownLabel[tag.name]) {
                    this.log('undefined tag',tag.name, tag.y);
                    this.unknownLabel[tag.name]=1;
                } else this.unknownLabel[tag.name]++;
            }
        }
    }
    addContent(rawcontent,format,fn) {
        //for multiple content, keep starting
        this.context.startY+=this.context.prevLineCount;
        this.context.filename=fn;
        this.context.ptkline=this.writer.header.lineCount; //ptk line count
        try{
            const Formatter=getFormatter(format);
            const formatter=new Formatter(this.context,this.log);
            const {text,tags,rawlines}=formatter.scan(rawcontent);

            this.context.linesOffset=linesOffset(text);
            this.context.rawlinesOffset=linesOffset(rawlines);
            this.context.lineCount=text.length;
            
            if (this.opts.onContent) {
                this.opts.onContent(fn,text,tags,rawlines);
            } else {
                this.doTags(tags,text);
                if (this.opts.raw) this.context.rawtags.push(...tags);
                this.writer.append(rawlines);
            }
            this.context.prevLineCount=text.length;
        } catch(e){
            const {filename,fileline,title}=this.context;
            this.log( filename+'('+fileline+'):' , title, e );
            throw '';
        }
    }
    async addFile(file,format){ //file=='string' nodejs , File browser local file, or a File in zip
        let fn=file;
        if (typeof file!=='string' && 'name' in file) {
            fn=file.name;
        }
        if (fn.endsWith('.zip')) {
            return await this.addZip(file,format);
        } else if (fn.endsWith('.lst')) {
            return await this.addLst(file,format);
        }

        if (this.finalized) {
            this.log("cannot addFile, finalized");
            return;
        }
        const rawcontent=await fileContent(file,format,this.context);

        this.addContent(rawcontent,format,fn);
    }
    save(opts){
        if (!this.finalized) {
            this.log('not finalized');
            return;
        }

        return this.writer.save(opts,this.config);
    }
    finalize(opts={}){
        this.writer.addSection('labels');
        const section=serializeLabels(this.labeldefs,this.context )
        this.writer.append(section);

        this.finalized=true;
        return this.context;
    }
}

export default Builder;