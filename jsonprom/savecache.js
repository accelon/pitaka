class CacheSaver {
    constructor (opts){
        this.log=opts.log||console.log;
    }
    init(){

    }
    async writeChunk(chunk,rawcontent){
    }
    async done(){
        this.log('writing to cacheStorage')
    }
}
export default CacheSaver;