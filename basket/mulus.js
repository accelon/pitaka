import {extractOfftag} from 'pitaka/offtext'
import {bsearch} from 'pitaka/utils'

function getMulu(from,to){ //本頁目錄加上 前後科文
    const out=[];
    let firstlevel=0;
    for (let i=from;i<to;i++) {
        const linetext=this.getLine(i);
        if (!linetext)continue;
        if (linetext.indexOf('^mu')>0) {
            const otags=extractOfftag(linetext,'mu\\d+');
            otags.forEach(o=>{
                const n=parseInt(o.n);
                if (!firstlevel) firstlevel=n;
                n&&out.push([n,o.t, i]);
            }) 
        }
    }
    let lastlevel=(out.length)?out[0][0]:0;
    //往上找父節點
    const mu=this.getLabel('mu');
    if (!mu) return out;
    let i=bsearch(mu.linepos,from,true);
    let lvl=firstlevel-1;
    if (lvl>0) {
        while (i>0) {
            if (mu.level[i]<=lvl){
                out.unshift([mu.level[i], mu.names[i], mu.linepos[i], this.pageAt(mu.linepos[i]),mu.linepos[i]]);
                lvl=mu.level[i]-1;
            }
            i--;
        }
    }
    //往下找第二父節點
    i=bsearch(mu.linepos,to,true);
    lvl=lastlevel;
    if (lvl>0) {
        while (i<mu.linepos.length) {
            if (mu.level[i]<lvl){
                out.push([mu.level[i], mu.names[i],mu.linepos[i],this.pageAt(mu.linepos[i]),mu.linepos[i]]);
                lvl=mu.level[i];
            }
            i++;
        }
    }
    return out;
}
export function getBooks(){
    const out=[];
    const lblbk=this.getLabel('bk');
    for (let j=0;j<lblbk.names.length;j++) {
        const from=lblbk.linepos[j],to=lblbk.linepos[j+1];
        out.push( {name:lblbk.names[j],id:lblbk.idarr[j], from,to}  )
    }
    return out;
}
export default {getMulu,getBooks};