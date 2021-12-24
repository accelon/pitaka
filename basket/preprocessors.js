import {fromIAST} from 'provident-pali';
import {OFFTAG_REGEX_G} from '../offtext/index.js';

const IAST2Provident=content=>{
    let s='';
    const lines=content.split(/\r?\n/);
    for (let i=0;i<lines.length;i++) {
        const line=lines[i];
        const out=[];
        let prev=0;
        line.replace(OFFTAG_REGEX_G, (m,m1,m2,offset)=>{
            if (offset>prev) out.push( line.substring(prev,offset) );
            out.push('^'+m1+(m2?m2:''));
            prev=offset+m.length;
        });
        if (prev<line.length-1) out.push(line.substring(prev))
        for (let j=0;j<out.length;j++) {
            if (out[j][0]!=='^')  {
                out[j]=fromIAST(out[j]);
            }
        }
        s+=out.join('');
        if (i) s+='\n'
    }
    // console.log(s.split(/\r?\n/))
    return s;
}
export default {IAST2Provident};