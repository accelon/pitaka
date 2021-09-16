import save from './savejsonp.js'
import { readFileSync} from 'fs'

class JSONPROMW {
    constructor(opts) {
        this.context = {
            accLength:0,
        };
        this.header= {
            name:opts.name||'noname' ,
            title:opts.title||'notitle',
            lineCount: 1,
            chunkStarts:[1],
            sectionStarts:[1],
            sectionNames:['txt'],
            buildtime:(new Date()).toISOString()
        }

        const lines=[''];
        this._lines=lines;

        this.opts = Object.assign({ chunkSize: 128 * 1024 },opts);
        this.save = save;
        return this;
    }
    append(lines){
        const ctx=this.context;
        const header=this.header;
        let acc=ctx.accLength||0;
        for (let i=0;i<lines.length;i++) {
            acc+=lines[i].length;
            if (acc>=this.opts.chunkSize) {
                header.chunkStarts.push(i+header.lineCount);
                acc=0;
            }
            this._lines.push(lines[i]);
        }
        ctx.accLength=acc;
        header.lineCount+=lines.length;
    }
    appendFile(fn,format='utf8'){
        const lines=readFileSync(fn,format).split(/\r?\n/);
        this.append(lines);
    }
    addSection(name){
        this.header.sectionNames.push(name);
        this.header.sectionStarts.push(this.header.lineCount);
    }
}

export default JSONPROMW;