class JsonpSaver {
    constructor (opts) {
        this.folder=opts.folder;
        if (!fs.existsSync(opts.folder)) fs.mkdirSync(opts.folder);
    }
    async writeChunk (chunk,rawcontent) {
        const fn=this.folder+'/'+ chunk.toString().padStart(3,'0')+'.js';
        await fs.promises.writeFile(fn,rawcontent,'utf8');        
    }
    done(){
        
    }
}

export default JsonpSaver;