const chunkOfLine=(line,chunkStarts)=>{
    for (let i=1;i<chunkStarts.length;i++) {
        if (chunkStarts[i]>line) return i;
    }
    return chunkStarts.length;
}
async function prefetchLines(nline,count){ //getLine is valid
    if (nline<1) throw 'wrong line number '+nline;
    const loadedChunk=this.context.loadedChunk;
    if (!loadedChunk[0]) await this.load(0);

    const cstart=chunkOfLine(nline,this.header.chunkStarts);
    const cend=chunkOfLine(nline+count,this.header.chunkStarts);
    
    const toLoad=[];
    for (let i=cstart;i<cend+1;i++) {
        if (!loadedChunk[i]) toLoad.push(this.load(i));
    }
    await Promise.all(toLoad);
}
async function readLines(nline,count=1){
    await prefetchLines.call(this,nline,count);
    const out=[];
    for (let i=nline;i<nline+count;i++) {
        out.push( [i, this.getLine(i)]);
    }
    return out;
}
export {prefetchLines, readLines}