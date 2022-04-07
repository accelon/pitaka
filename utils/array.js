export const intersect=(arr1,arr2)=>{
    const out=[];
    let j=0;
    for (let i=0;i<arr1.length;i++) {
        let v=arr1[i];
        while (j<arr2.length) {
            if (arr2[j]>=v) break;
            j++;
        }
        if (v==arr2[j]) out.push(v);
        if (j==arr2.length) break;
    }
    return out;
}