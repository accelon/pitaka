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
                n&&out.push([n,o.t]);
            }) 
        }
    }
    let lastlevel=(out.length)?out[0][0]:0;
    //往上找父節點
    const mu=this.findLabel('mu');
    let i=bsearch(mu.linepos,from,true);
    let lvl=firstlevel-1;
    if (lvl>0) {
        while (i>0) {
            if (mu.level[i]<=lvl){
                out.unshift([mu.level[i], mu.names[i], mu.linepos[i]]);
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
                out.push([mu.level[i], mu.names[i], mu.linepos[i]]);
                lvl=mu.level[i];
            }
            i++;
        }
    }
    return out;
}

export default {getMulu};