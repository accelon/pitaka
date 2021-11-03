import JSZip from '../3rdparty/jszip.js' //need tailored version of jszip.

function readInt(buf,idx,size) {
    var result = 0,  i;
    for (i = idx + size - 1; i >= idx; i--) {
       result = (result << 8) + buf[i];
    }
    return result;
}
const fetchBuf= async (f,zipbuf,offset,end)=>{
    fs.readSync(f,zipbuf, offset, end-offset, offset );
    return true;
}
const fetchZIPEntries=async (f,zipbuf)=>{
    const i=zipbuf.length-22; //skip the localPart Header
    const dirSize=readInt(zipbuf,i+0xc,4)
    const dirOffset=readInt(zipbuf,i+0xc+4,4)
    return await fetchBuf(f,zipbuf,dirOffset,dirOffset+dirSize);
}
const debug=false;
const LaZip= async function(zipfn){
    const handle=fs.openSync(zipfn,'r');

    const headbuf=new Uint8Array(16);
    const ok=await fetchBuf(handle,headbuf, 0, 15);

    if (!ok) return null;
    let filesize;
    if (headbuf[0]!==0x50 || headbuf[1]!==0x4B) {
        console.error('invalid zip file',zipfn);
        return false;
    }

    const {size}=fs.fstatSync(handle);
    filesize=size;

    debug&&console.time('allot memory')
    const zipbuf=new Uint8Array(filesize);
    let bufoffset=filesize-1024;
    if (bufoffset<0) bufoffset=0;   
    if (!await fetchBuf(handle,zipbuf, bufoffset, filesize-1)) {
        debug&&console.log('cannot fetch central directory record')
        return;
    }
    debug&&console.timeEnd('allot memory')

    debug&&console.time('load entries')
    if (!await fetchZIPEntries(handle,zipbuf)) {
        debug&&console.log('cannot fetch central entries')
        return;
    }
    debug&&console.timeEnd('load entries');

    debug&&console.time('loadAsync')
    const jszip=await JSZip.loadAsync(zipbuf,{lazyfetch:true});
    debug&&console.timeEnd('loadAsync')

    const fetchFile=async function(fn){
        const i=jszip.fileNames[fn]; //all filenames in zip
        if (i>-1) {
            const entry=jszip.fileEntries[i];
            const {localHeaderOffset,compressedSize}=entry;
            const sz=localHeaderOffset+compressedSize+1024; //assuming no per file comment
            await fetchBuf(handle,zipbuf, localHeaderOffset, sz);

            //defering readLocalFiles()
            jszip.reader.setIndex(entry.localHeaderOffset+4); //signature 4 bytes
            entry.readLocalPart(jszip.reader);
            entry.processAttributes();

            //create an entry in jszip.files , jszip.files stored fetched file
            //defering addFiles(results) in prepareContent
            jszip.file(entry.fileNameStr, entry.decompressed, {
                binary: true, optimizedBinaryString: true,
                date: entry.date,dir: entry.dir,
                comment: entry.fileCommentStr.length ? entry.fileCommentStr : null,
                unixPermissions: entry.unixPermissions,
                dosPermissions: entry.dosPermissions
            });
            //compressed data is ready
            return jszip.files[fn];
        }
        return null;
    }
    const readTextFile=async function(fn) {
        let f=jszip.files[fn];
        if (!f) f=await fetchFile(fn);
        if (f) return await f.async("string");
    }
    return {readTextFile,fetchFile,jszip};
}

LaZip.JSZip=JSZip;
LaZip.loadAsync=JSZip.loadAsync;
export default LaZip;