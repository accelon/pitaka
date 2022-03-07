import {bsearch} from '../utils/bsearch.js';
export async function getNotes(from,count){
    if (!this.notes) return [];
    const {section,linepos,idarr}=this.notes;
    const start=bsearch(linepos,from-1,true);
    const end=bsearch(linepos,from+count+1,true);

    await this.prefetchLines(start + section , end-start+1);
    const out={};
    for (let i=start;i<=end;i++) {
        if (linepos[i]>=from && linepos[i]<=from+count) {
            let note=this.getLine(section+i);
            if (idarr && idarr[i]) note+='\t'+idarr[i];
            if (!out[ linepos[i]] ) out[linepos[i]]=[];
            out[linepos[i]].push(note);
        }
    }
    return out;
}
export default {getNotes}