import {extractOfftagPattern,parseOfftextLine} from '../offtext/index.js'
import {bsearch} from '../utils/index.js'
import TLabelMulu from '../htll/mulu.js'
function getMulu(from,to){ //本頁目錄加上 前後科文
    const out=[];
    let firstlevel=0;
    const mlbl=this.findLabelType("LabelMulu");
    if (!mlbl) return out;

    const mtag=mlbl.name;
    for (let i=from;i<to;i++) {
        const linetext=this.getLine(i);
        if (!linetext)continue;
        const at=linetext.indexOf('^'+mtag);
        if (at>-1) {
            const otags=extractOfftagPattern(linetext,mtag+'\\d*');
            otags.forEach(([o,putback,taglen])=>{
                const n=parseInt(o.id) || 1;
                if (!firstlevel) firstlevel=n;
                let t=o.t||putback;
                if (!t) { //use entire line as t for yinshun
                    const [text]=parseOfftextLine(linetext);
                    t=text;
                }
                n&&out.push([n,t , i]);
            }) 
        }
    }
    let lastlevel=(out.length)?out[0][0]:0;
    //往上找父節點
    const mu=this.getLabel(mtag);

    if (!mu || !mu.level) return out;
    let i=bsearch(mu.linepos,from,true);
    let lvl=firstlevel-1;
    if (lvl>0) {
        while (i>0) {
            if (mu.level[i]<=lvl){
                out.unshift([mu.level[i], mu.names[i], mu.linepos[i], this.locOf(mu.linepos[i]),mu.linepos[i]]);
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
                out.push([mu.level[i], mu.names[i],mu.linepos[i],this.locOf(mu.linepos[i]),mu.linepos[i]]);
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