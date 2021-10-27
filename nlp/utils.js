const reversify=links=>{ 
    const out={};
    for (let n in links) {
        for (let j=0;j<links[n].length;j++) {
            const it=links[n][j];
            if (!out[it]) out[it]=[];
            out[it].push(n);
        }
    }
    return out;
}
const reversify2=(links,children)=>{
    const out=[];
    for (let i=0;i<links.length;i++) {
        for (let j=0;j<children[i].length;j++) {
            const it=children[i][j];
            if (!out[it]) out[it]=[];
            out[it].push(i);
        }
    }
    return out;
}
export {reversify,reversify2};