import {chunkjsfn} from '../utils/index.js'
class ZipSaver {
    constructor(opts){
        this.name=opts.name;
        /* node.js program must load zip manually, 
           rollup : UMD and IIFE output formats are not supported for code-splitting builds. */
        const Zip= (typeof JSZip!=='undefined' && JSZip) || lazip.JSZip; 
        this.zip=new Zip();
        this.file=opts.file;
    }
    async init(){

    }
    async writeChunk(chunk,rawcontent){
        //prepand pitaka name as user might change name of zip
        //can store multiple pitaka in one zip
        //but for lazip, zip folder should be same as the name of zip 
        this.zip.file(chunkjsfn(chunk,this.name), rawcontent);
    }
    pitakaPatchNodeJs(fn){ 
        //save the size of zipfile in DATETIME of first file, and set flags bit 15 to true
        //work around for method HEAD not returning content-length
        const f=fs.openSync(fn,'r+');
        const {size}=fs.fstatSync(f);
        const sz=new Uint32Array([size]);
        const signature=new Uint8Array(1);
        //see ZIP file format detail
        fs.readSync(f,signature, 0, 1, 7);
        signature[0]  |= 0x80; //turn on bit 15
        fs.writeSync(f, signature, 0, 1, 7); //seems like flags
        fs.writeSync(f, sz, 0, 4, 10); //4 bytes DOS DATE TIME
        fs.closeSync(f)
    }

    async doneNodeJs() {
        const zipfn=this.name+'.ptk';
        const writable=fs.createWriteStream(zipfn);

        await new Promise(resolve=>{
            this.zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
            .pipe(writable)
            .on('finish', function () {
                resolve();
            });
        })
        this.pitakaPatchNodeJs(zipfn);
    }
    async done(){
        if (!this.file) return await this.doneNodeJs();
        let writable=await this.file.createWritable();
        const zipcontent=await this.zip.generateAsync({type:"uint8array",compression:'DEFLATE'});

        let sz=zipcontent.length;
        zipcontent[7]|=0x80;
        let offset=10;
        while (offset<14) { //write big endian
            zipcontent[offset]= sz & 0xff;
            offset++;
            sz>>=8;
        }
        await writable.write(zipcontent);
        await writable.close();
    }
}

export default ZipSaver;