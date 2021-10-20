const trimMulu=(level,from,to)=>{
    const out=[];
    if (from>=to) return out;
    let toplv=parseInt(level[from]);
    let bottomlv=parseInt(level[to]);
    let upper=from,lower=from;
    for (let i=from;i<=to;i++) {
        const lv=parseInt(level[i]);
        if (toplv>lv) {
            upper=i;
            toplv=lv;
        } else if (lv>toplv) break;
    }
    for (let i=to;i>from;i--) {
        if (i<=upper) break;
        const lv=parseInt(level[i]);
        if (bottomlv>lv) {
            lower=i;
            bottomlv=lv;
        }
    }
    //tocnodes between upper to lower are removed

    toplv=parseInt(level[from]);
    //remove unreachable node from above chunk
    out.push(from);
    for (let i=from+1;i<=upper;i++) {
        const lv=level[i];
        if (lv<toplv) {
            if(lv && out[out.length-1]!==i) out.push(i);
            toplv=lv;
        }
    }
    //remove unreachable node from below chunk
    let pi=lower, lastout=lower;
    bottomlv=parseInt(level[lower]);    
    for (let i=lower+1;i<=to;i++) {
        const lv=level[i];
        if (lv>bottomlv) {
            bottomlv=lv;
            lv&&pi!==out[out.length-1] && out.push(pi);
            lastout=pi;
            pi=i;
        }  else if (lv==bottomlv) pi=i;
    }
    if (out[out.length-1]!==to) out.push(to);
    return out;
}

export function trimInnerMulu(_names,_level,_linepos){
/*   66554445666665555666334455666
     ^ ^ ^                ^ ^  ^ ^ 
 
*/
    const out={names:[],level:[],linepos:[]}
//4987, 5059
    let i=0,upper=0,lower=0,prev=0;
    while (_level[i]==0 && i<_level.length) {
        prev=i;
        i++
    }
    while (i<_linepos.length) {
        if (_level[i]==0) { //chunk breaker
            if (prev>=i-1) {
                if (_level[prev]) {
                    out.names.push(_names[prev]);
                    out.level.push(_level[prev]);
                    out.linepos.push(_linepos[prev]);
                }
            } else {
                const keep=trimMulu(_level,prev,i-1);
                console.log(keep)
                keep.forEach(idx=>{
                    if (_level[idx]){
                        out.names.push(_names[idx])
                        out.level.push(_level[idx])
                        out.linepos.push(_linepos[idx])    
                    }
                })
            }
            prev=i+1;
        }
        i++;
    }
    return out;
}