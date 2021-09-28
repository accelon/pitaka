import {chunkjsfn} from '../utils/index.js'
class JsonpSaver {
    constructor (opts) {
        this.name=opts.name;
        if (!fs.existsSync(opts.name)) fs.mkdirSync(opts.name);
    }
    async init(){

    }
    async writeChunk (rawcontent,chunk) {
        const fn=chunkjsfn(chunk,this.name);
        await fs.promises.writeFile(fn,rawcontent,'utf8');        
    }
    async done(){
        
    }
}

export default JsonpSaver;