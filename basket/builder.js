import {getFormatter, getZipIndex, getFormatTypeDef, fileContent} from '../format/index.js'
import JSONPROMWriter from '../jsonprom/jsonpromw.js';
import {serializeLabels} from './serialize-label.js';

class Builder {
    constructor(opts) {
        // this.labelTypes=[];
        this.context={namespaces:{},namespace:'',eudc:{},nchapter:0,rawtags:[] 
                    ,filename:'',ptkline:0};
        this.writer=new JSONPROMWriter(Object.assign({},opts,{context:this.context}));
        this.finalized=false;
        this.log=opts.log || console.log;
        this.config=opts.config;
        this.opts=opts;
        this.labelTypes=getFormatTypeDef(this.config.format,{context:this.context,log:this.log});

        return this;
    }
    async addZip(file,format){
        let fn=file;       
        if (typeof file!=='string' && 'name' in file) {
            fn=file.name;
        }
        
        const jszip=new JSZip();
        let zip;
        if (typeof file=='string') {
            if (!fs.existsSync(file)) {
                if (!this.config.allowmissingfile) this.log('missing file',fn);
                else return;
            }
            const data=await fs.promises.readFile(file);
            zip=await jszip.loadAsync(data);
        } else {
            zip=await jszip.loadAsync(file.getFile());
        }

        this.context.error=0;
        const {zipfiles,toclines}=await getZipIndex(zip,format);
        if (toclines) {
            this.context.filename='index';
            this.addContent(toclines.join('\n'),format);
        }
        for (let i=0;i<zipfiles.length;i++) {
            await this.addFile({name:zipfiles[i],zip},format);
        }
        if (this.context.error) this.log(fn,'has',this.context.error,'errors')
    }
    addContent(rawcontent,format) {
        this.context.ptkline=this.writer.header.lineCount; //ptk line count
        this.context.namespace=fn.replace(/^\.\//,'')
             .replace(/\..+/,'')//extension
             .replace(/[\\\/].+?/,'') //subfolder 
            ||'*' //global context
        this.context.namespaces[this.context.namespace]=0;

        try{
            const Formatter=getFormatter(format);
            const formatter=new Formatter(this.context,this.log);
            const {text,tags}=formatter.scan(rawcontent);

            for (let i=0;i<tags.length;i++) {
                const tag=tags[i];
                const labeltype=this.labelTypes[tag.name];
                if (labeltype) {
                    const linetext=text[tag.line - this.context.ptkline ];
                    labeltype.action(tag,linetext);
                } else this.log('undefined tag',tag.name)
            }

            if (this.opts.raw) this.context.rawtags.push(...tags);

            this.writer.append(text);
            
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
        }

        if (this.finalized) {
            this.log("cannot addFile, finalized");
            return;
        }
        const rawcontent=await fileContent(file,format);
        this.context.filename=fn;
        this.addContent(rawcontent,format);
    }
    save(opts){
        if (!this.finalized) {
            this.log('not finalized');
            return;
        }
        // return this.writer.save(opts,this.config);
    }
    finalize(opts={}){
        for (let label in this.labelTypes) { 
            this.labelTypes[label].finalize();
        }
        // this.writer.addSection('labels');
        // const section=serializeLabels(this.labelTypes )
        // this.writer.append(section);
        //indexes

        this.finalized=true;
        return this.context;
    }
}

export default Builder;