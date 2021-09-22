export async function readFiles(files,onFile){
    if (typeof fs!=='undefined') {

    } else {
        for (let i=0;i<files.length;i++){
            const fileHandle=files[i];
            const f = await fileHandle.getFile();
            const contents = await f.text();
            const stop=await onFile(contents,fileHandle.name);
            if (stop) break;
        }
    }
}

export async function readTextFile(file,opts={}){
    const {start=0,len=65535}=opts;
    if (typeof fs!=='undefined' && typeof file=='string') {
        let content= (await fs.promises.readFile(file,'utf8')).replace(/\r?\n/g,'\n');
        if (len<0)len=content.length;
        return content.substr(start,len);
    } else {
        const f=await file.getFile();
        let content= (len>0?await f.slice(start,len).text():await f.text());
        if (len>0 && f.size>len) {
            content+='\n---filesize---'+f.size;
        }
        return content;
    }
}

export async function readBLOBFile(file,opts={}){
    if (typeof fs!=='undefined' && typeof file=='string') {
        return (await fs.promises.readFile(file));
    } else {
        const f=await file.getFile();
        return await f.arrayBuffer();
    }
}
