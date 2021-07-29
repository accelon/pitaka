export const parseArg=str=>{
    const out={};
    const pat=/([A-Z_]+[^A-Z_]+)/;
    const pat2=/([A-Z_]+)([^A-Z_]+)/;

    str.split(pat).filter(i=>!!i).forEach(item=>{
        const m=item.match(pat);
        if (m) {
            const [i,key,value]=item.match(pat2);
            out[key]=value;
        } else {
            out['$']=item;
        }
    })
    return out;
}

export const parseAttr=str=>{
    const out={};
    let count=0;
    str.replace(/([a-z]+)="(.*?)"/g,(m,attr,value)=>{
        count++;
        out[attr]=value;
    })
    return count?out:null;
}