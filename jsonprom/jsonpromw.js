import save from './save.js'

class JSONPROMW {
    constructor(opts) {
        this.context = opts.context;
        this.accLength=0;
        this.header= {
            name:opts.name||'noname' ,
            title:opts.title||'notitle',
            lineCount: 1,
            appendCount:0,
            chunkStarts:[1],
            sectionStarts:[1],
            fileStarts:[],
            sectionNames:['txt'],
            buildtime:(new Date()).toISOString()
        }

        const lines=[''];
        this._lines=lines;
        this.textEnd=0;
        this.save=save;
        this.opts = Object.assign({ chunkSize: 128 * 1024 },opts);
        return this;
    }
    append(lines,isSourceFile=true){
        if (typeof lines=='string') lines=lines.split(/\r?\n/);
        const header=this.header;
        let acc=this.accLength||0;
        if (isSourceFile) header.fileStarts.push(header.lineCount);

        for (let i=0;i<lines.length;i++) {
            acc+=lines[i].length;
            if (acc>=this.opts.chunkSize) {
                header.chunkStarts.push(i+header.lineCount);
                acc=0;
            }
            this._lines.push(lines[i]);
        }
        this.accLength=acc;
        header.lineCount+=lines.length;
        
        header.appendCount++;
    }
    appendFile(fn,format='utf8'){
        const lines=fs.readFileSync(fn,format).split(/\r?\n/);
        this.append(lines);
    }
    addSection(name){
        this.header.sectionNames.push(name);
        this.header.sectionStarts.push(this.header.lineCount);
        if (!this.textEnd) this.textEnd=this.header.lineCount
    }
}

export default JSONPROMW;