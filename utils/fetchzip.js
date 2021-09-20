import JSZip from '../3rdparty/jszip'
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
      const i=zipbuf.length-22;
  
      const dirSize=readInt(zipbuf,i+0xc,4)
      const dirOffset=readInt(zipbuf,i+0xc+4,4)
  
      return await fetchBuf(url,zipbuf,dirOffset,dirOffset+dirSize);
  
      // return (centralDirSize,centralDirOffset);
  }

export default async function(url){
    let res=await fetch(url,{method:'HEAD'});
    const filesize=parseInt(res.headers.get('Content-Length'));
    const zipbuf=new Uint8Array(filesize);
    let bufoffset=filesize-1024;
    if (bufoffset<0) bufoffset=0;   
    if (!await fetchBuf(url,zipbuf, bufoffset, filesize-1)) {
        console.log('cannot fetch central directory record')
        return;
    }
    if (!await fetchZIPEntries(url,zipbuf)) {
        console.log('cannot fetch central entries')
        return;
    }

    const jszip=await JSZip.loadAsync(zipbuf,{lazyfetch:true});
    const fetchFile=async function(fn){
        const i=jszip.fileNames[fn]; //all filenames
        if (i>-1) {
            const file=jszip.fileEntries[i];
            const {localHeaderOffset,compressedSize}=file;
            const sz=localHeaderOffset+compressedSize+1024; //assuming no per file comment
            await fetchBuf(url,zipbuf, localHeaderOffset, sz);

            //defering readLocalFiles()
            jszip.reader.setIndex(file.localHeaderOffset+4); //signature 4 bytes
            file.readLocalPart(jszip.reader);
            file.processAttributes();

            //create an entry in jszip.files , files only stored unpacked file
            //defer of addFiles(results) in prepareContent
            jszip.file(file.fileNameStr, file.decompressed, {
                binary: true, optimizedBinaryString: true,
                date: file.date,dir: file.dir,
                comment: file.fileCommentStr.length ? file.fileCommentStr : null,
                unixPermissions: file.unixPermissions,
                dosPermissions: file.dosPermissions
            });
            return jszip.files[fn];
        }
        return null;
    }
    const readTextFile=async function(fn) {
        let f=jszip.files[fn];
        if (!f) f=await fetchFile(fn);
        if (f) {
            const content=await f.async("string");
            return content;
        }
    }
    return {readTextFile,fetchFile,jszip};
}
