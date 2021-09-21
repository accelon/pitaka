import {chunkjsfn} from '../utils/index.js'
class JsonpSaver {
    constructor (opts) {
        this.folder=opts.folder;
        if (!fs.existsSync(opts.folder)) fs.mkdirSync(opts.folder);
    }
    async init(){

    }
    async writeChunk (chunk,rawcontent) {
        const fn=this.folder+'/'+ chunkjsfn(chunk);
        await fs.promises.writeFile(fn,rawcontent,'utf8');        
    }
    async done(){
        
    }
}

export default JsonpSaver;