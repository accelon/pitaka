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

export const removeSubstring=(arr,debug)=>{
    const markdelete=[];
    for (let i=0;i<arr.length;i++) {
        for (let j=0;j<arr.length;j++) {
            if (i==j) continue;
            if (arr[i].indexOf(arr[j])>-1 && arr[j].length<arr[i].length) {
                if (markdelete.indexOf(j)==-1) markdelete.push(j);
            }
        }
    }
    return arr.filter( (it,idx)=> markdelete.indexOf(idx)==-1 );
}