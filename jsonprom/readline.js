import {bsearch} from '../utils/bsearch.js';
const chunkOfLine=(line,chunkStarts)=>{
    if (line>=chunkStarts[chunkStarts.length-1]) return chunkStarts.length;
    return bsearch(chunkStarts,line,true);
}
function unreadyChunk(from,to){
    if (from<1) {
        return [];
        // throw 'wrong line number '+from;
    }
    if (from>to) to+=from;
    const loadedChunk=this.context.loadedChunk;
    // if (!loadedChunk[0]) await this.load(0);

    const cstart=chunkOfLine(from,this.header.chunkStarts);
    const cend=chunkOfLine(to,this.header.chunkStarts);
    
    const unready=[];
    for (let i=cstart;i<cend+1;i++) {
        if (!loadedChunk[i]) unready.push(i);
    }
    return unready;
}
async function prefetchLines(from,to){ //getLine is valid
    let unready;
    if (Array.isArray(from)) {
        const notready={};
        for (let i=0;i<from.length;i++) {
            notready[chunkOfLine(from[i],this.header.chunkStarts)]=true;
        }
        unready=Object.keys(notready).map(it=>parseInt(it));
    } else {
        if (from>to) to+=from;
        if (!to) to=from+1;
        unready=this.unreadyChunk(from,to);    
    }

    const jobs=[];
    unready.forEach(ck=>jobs.push(this.load(ck)));
    if (jobs.length) await Promise.all(jobs);
}
async function prefetchChunks(chunks){
    const jobs=[];

    chunks.forEach(ck=>jobs.push(this.load(ck)));
    if (jobs.length) await Promise.all(jobs);
}
async function readLines(nline,count=1){
    await prefetchLines.call(this,nline,nline+count);
    const out=[];
    for (let i=nline;i<nline+count;i++) {
        out.push( [i, this.getLine(i)]);
    }
    return out;
}
export {prefetchLines, readLines, unreadyChunk,prefetchChunks}