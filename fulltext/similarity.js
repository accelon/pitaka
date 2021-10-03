import {diffChars} from 'diff';
export const similarity=(s1,s2)=>{
    let sim=0 , differ=0,equal=0;
    const d=diffChars(s1,s2);
    d.forEach(v=>{
        if (v.added || v.removed ) {
            differ+= v.value.replace(/[^\u3400-\u9fff]/g,'').length;
        } else {
            equal+=v.value.length ;
        }
    })
    return  equal*2 / (s1.length+s2.length) ;
}

