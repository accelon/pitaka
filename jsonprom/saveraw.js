class RawSaver {
    constructor (opts) {
        this.name=opts.name;
        this.context=opts.context;
        this.txthandle=fs.openSync(opts.name+'-raw.off','w');
    }
    async init(){

    }
    async writeChunk (rawcontent) {
        await new Promise( resolve=>{
            fs.write(this.txthandle,rawcontent,resolve);
        })
    }
    async done(){
        await fs.close(this.txthandle);
    }
}

export default RawSaver;