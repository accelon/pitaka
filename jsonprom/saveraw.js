class RawSaver {
    constructor (opts) {
        this.name=opts.name;
        this.filehandle=fs.openSync(opts.name+'-raw.txt','w');
    }
    async init(){

    }
    async writeChunk (rawcontent) {
        await new Promise( resolve=>{
            fs.write(this.filehandle,rawcontent,resolve);
        })
    }
    async done(){
        
        await fs.close(this.filehandle);
    }
}

export default RawSaver;