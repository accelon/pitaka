// obsolete code
import JSZip from '../3rdparty/jszip.js' //need tailored version of jszip.

function readInt(buf,idx,size) {
    var result = 0,  i;
    for (i = idx + size - 1; i >= idx; i--) {
       result = (result << 8) + buf[i];
    }
    return result;
}
const fetchBuf= async (url,zipbuf,offset,end)=>{
    const res=await fetch(url,{headers: {
        'content-type': 'multipart/byteranges',
        'range': 'bytes='+offset+'-'+end,
    }});

    if (res.ok) {
        const lastpart=new Uint8Array( await res.arrayBuffer());
        zipbuf.set(lastpart , offset);
        return true;
    }
    return false;
}
const fetchZIPEntries=async (url,zipbuf)=>{
    const i=zipbuf.length-22; //skip the localPart Header
    const dirSize=readInt(zipbuf,i+0xc,4)
    const dirOffset=readInt(zipbuf,i+0xc+4,4)
    return await fetchBuf(url,zipbuf,dirOffset,dirOffset+dirSize);
}
const debug=false;
const LaZip= async function(url){
    const headbuf=new Uint8Array(16);
    const ok=await fetchBuf(url,headbuf, 0, 15);

    if (!ok) return null;
    let filesize;
    if (headbuf[0]!==0x50 || headbuf[1]!==0x4B) {
        console.error('invalid zip file',url);
        return false;
    }
    if (headbuf[7]&0x80) { //reserve bit 15 of flags
        //use TIME STAMP to store zip file size, normally local file headers are skipped.
        //workaround for chrome-extension HEAD not returning content-length
        filesize=readInt(headbuf,0xa,4);
    } else { //use HEAD
        let res=await fetch(url,{method:'HEAD'});
        filesize=parseInt(res.headers.get('Content-Length'));
    }    

    if (isNaN(filesize)) {
        debug&&console.error('unable to get filesize');
        return false;
    }
    debug&&console.timeEnd('head')

    debug&&console.time('allot memory')
    const zipbuf=new Uint8Array(filesize);
    let bufoffset=filesize-1024;
    if (bufoffset<0) bufoffset=0;   
    if (!await fetchBuf(url,zipbuf, bufoffset, filesize-1)) {
        debug&&console.log('cannot fetch central directory record')
        return;
    }
    debug&&console.timeEnd('allot memory')

    debug&&console.time('load entries')
    if (!await fetchZIPEntries(url,zipbuf)) {
        debug&&console.log('cannot fetch central entries')
        return;
    }
    debug&&console.timeEnd('load entries')


    debug&&console.time('loadAsync')
    const jszip=await JSZip.loadAsync(zipbuf,{lazyfetch:true});
    debug&&console.timeEnd('loadAsync')

    const fetchFile=async function(fn){
        const i=jszip.fileNames[fn]; //all filenames in zip
        if (i>-1) {
            const entry=jszip.fileEntries[i];
            const {localHeaderOffset,compressedSize}=entry;
            const sz=localHeaderOffset+compressedSize+1024; //assuming no per file comment
            await fetchBuf(url+'#'+fn,zipbuf, localHeaderOffset, sz);

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