import { prepareInput } from './input.js';

const longline= async (config)=>{
    let total=0;
    const [lines]=await prepareInput(config);
    const out=[];
    for (let i=0;i<lines.length;i++) {
        out.push([i,lines[i].length]);
        total+=lines[i].length;
    }
    out.sort((a,b)=>b[1]-a[1]);
    const avg=total/lines.length;

    console.log(out.filter(a=>a[1]> 7*avg))
    console.log('average', total/lines.length)
};
export default longline;