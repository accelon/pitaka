import {bookParanumToChunk,firstParanumOf} from "./cs-paranum.js";
import { FirstPN } from "./cs-first.js";
import { booksOf, pitakaOf,getFilesOfBook,sortFilenames} from "./sc-code.js";
export const suttaOfBookPrefix=bkpf=>{
    const out=[];
    if (bkpf[0]==='d')      for (let i=1;i<=34;i++) out[i-1]='d'+i;
    else if (bkpf[0]==='m') for (let i=1;i<=152;i++) out[i-1]='m'+i;
    else if (bkpf[0]==='s') for (let i=1;i<=56;i++) out[i-1]='s'+i;
    else if (bkpf[0]==='a') for (let i=1;i<=11;i++) out[i-1]='a'+i;
    return out;
}

export const cs ={
    firstParanumOf,bookParanumToChunk,FirstPN,suttaOfBookPrefix
}
export const sc={
    getFilesOfBook,pitakaOf,booksOf,sortFilenames
}
export default {cs,sc};