export const patchBuf=(buf,errata,fn='')=>{
    if (!errata||!errata.length) return buf;
    let outbuf=buf;

    for (let i=0;i<errata.length;i++) {
        const [from,to]=errata[i];
        let occur=errata[i][2]||1;
        if (typeof from=='string') {
            while (occur) {
                const newoutbuf=outbuf.replace(from,to);    
                if (newoutbuf===outbuf) {
                    console.log(fn,"cannot replace",errata[i]);
                }
                outbuf=newoutbuf;
                occur--;
            }
        } else {
            outbuf=outbuf.replace(from,()=>{
                occur--;
                return to;
            });    
        }
        if (occur!==0) {
            console.log(fn,"errata is not cleared!",occur,'left',errata[i]);
        }
    }

/*
    for (let i=0;i<lines.length;i++) {
        let line=lines[i];
        errata.forEach(err=>{
            if (typeof from==='string' && line.indexOf(from)==-1) return;
            const rline=line.replace(from,to);
            if (rline!==line) {
                err[2]--;
                lines[i]=rline;
                line=rline;
            }
        })
    }
    const residue=errata.filter(err=>err[2]);
    if (residue.length) console.log(fn,"errata is not cleared!",residue);
*/
    return outbuf;
}

export default {patchBuf}