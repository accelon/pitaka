class RawSaver {
    constructor (opts) {
        this.name=opts.name;
        this.context=opts.context;
        this.txthandle=fs.openSync(opts.name+'-raw.txt','w');
    }
    async init(){

    }
    async writeChunk (rawcontent) {
        await new Promise( resolve=>{
            fs.write(this.txthandle,rawcontent,resolve);
        })
    }
    async done(){
        fs.writeFileSync(this.name+'-raw.json', this.context.rawtags.map(item=>
            JSON.stringify(item)).join('\n'),'utf8');
        await fs.close(this.txthandle);
    }
}

export default RawSaver;