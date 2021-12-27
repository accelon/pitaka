import {toIAST,fromIAST} from 'provident-pali';
import {OFFTAG_REGEX_G} from '../offtext/index.js';
import { prepareInput } from './input.js';
const iast2provident=(content,reverse=false)=>{
    let s='';
    const lines=content.split(/\r?\n/);
    const convert=reverse?toIAST:fromIAST;
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
                out[j]=convert(out[j]);
            }
        }
        s+=out.join('');
        if (i) s+='\n'
    }
    return s;
}

const iast=()=>{
    const fn=process.argv[3];
    const lines=fs.readFileSync(fn,'utf8').split(/\r?\n/);
    let err=0;
    for (let i=0;i<lines.length;i++) {
        const line=lines[i];
        const out=iast2provident(line);
        if (out!==line ) {
            const rev=iast2provident( out, true);
            if (rev!==line.toLowerCase()) {
                console.log('wrong conversion at',i+1);
                console.log('rev',rev)
                console.log('ori',line.toLowerCase())    
                console.log('ppl',out)
                console.log('')    
                err++;
                if (err>10) break;
            }
            lines[i]=out;
        }
    }
    if (!err) {
        console.log('overwrite',fn, 'lines',lines.length)
        fs.writeFileSync(fn,lines.join('\n'),'utf8');
    }
}

export default iast;