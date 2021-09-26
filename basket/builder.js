import {getFormatter, getZipIndex,fileLines} from '../format/index.js'
import JSONPROMWriter from '../jsonprom/jsonpromw.js';
import {serializeLabels} from './serialize-label.js';

class Builder {
    constructor(opts) {
        this.labelTypes=[];
        this.context={namespaces:{}};
        this.writer=new JSONPROMWriter(opts);
        this.finalized=false;
        this.log=opts.log || console.log;
        this.config=opts.config;
        return this;
    }
    defineLabel(name,Type,opts){
        this.labelTypes.push(new Type(name,opts));
    }
    async addZip(file,format){
        let fn=file;
        if (typeof file!=='string' && 'name' in file) {
            fn=file.name;
        }
        const jszip=new JSZip();
        let zip;
        if (typeof file=='string') {
            const data=await fs.promises.readFile(file);
            zip=await jszip.loadAsync(data);
        } else {
            zip=await jszip.loadAsync(file.getFile());
        }
        
        const zipfiles=await getZipIndex(zip,format);
        for (let i=0;i<zipfiles.length;i++) {
            await this.addFile({name:zipfiles[i],zip},format);
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
        const rawlines=await fileLines(file,format);
        const out=[];
        this.context.filename=fn;
        this.context.filenline=this.writer.header.lineCount;
        this.context.namespace=fn.replace(/^\.\//,'')
             .replace(/\..+/,'')//extension
             .replace(/[\\\/].+?/,'') //subfolder 
            ||'*' //global context
        this.context.namespaces[this.context.namespace]=0;

        for (let i=0;i<this.labelTypes.length;i++) {
            const lt=this.labelTypes[i];
            
            // if (lt.textual) handletext=true;
            // else handletag=true;
        }
        try{
            const Formatter=getFormatter(format);
            const formatter=new Formatter(this.context);
            formatter.scan(rawlines);
        } catch(e){
            const {filename,fileline,title}=this.context;
            this.log( filename+'('+fileline+'):' , title, e );
            throw '';
        }

        for (let i=0;i<this.labelTypes.length;i++) { 
            this.labelTypes[i].fileDone();
        }
        this.writer.append(out);//true to write starting of source  file
    }
    writeLabels(){
        this.writer.addSection('labels');
        const section=serializeLabels(this.labelTypes )
        this.writer.append(section);
    }
    saveJSONP(opts){
        this.save(Object.assign(opts,{jsonp:true}));
    }
    save(opts){
        if (!this.finalized) {
            this.log('not finalized');
            return;
        }
        return this.writer.save(opts,this.config)     
    }
    finalize(opts={}){
        for (let i=0;i<this.labelTypes.length;i++) { 
            this.labelTypes[i].finalize();
        }
        this.writeLabels();
        //indexes
        this.finalized=true;
        return this.context;
    }
}

export default Builder;