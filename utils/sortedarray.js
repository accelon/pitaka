const alphabetically=(a,b)=>a>b?1: ((a<b)?-1:0);
const alphabetically0=(a,b)=>a[0]>b[0]?1: ((a[0]<b[0])?-1:0);
const alphabetically1=(a,b)=>a[1]>b[1]?1: ((a[1]<b[1])?-1:0);
const alphabetically2=(a,b)=>a[2]>b[2]?1: ((a[2]<b[2])?-1:0); 

const length_alphabetically=(a,b)=> a.length==b.length?(a>b?1: ((a<b)?-1:0)):a.length-b.length;
const length_alphabetically0=(a,b)=>a[0].length==b[0].length?(a[0]>b[0]?1: ((a[0]<b[0])?-1:0)):a[0].length-b[0].length;
const length_alphabetically1=(a,b)=>a[1].length==b[1].length?(a[1]>b[1]?1: ((a[1]<b[1])?-1:0)):a[1].length-b[1].length;

const unique=(arr,dupitem=null)=>{
    arr.sort(alphabetically);
    const out=[arr[0]];
    for (let i=1;i<arr.length;i++) {
        if (arr[i]!==arr[i-1]) {
            out.push(arr[i])
        } else if (dupitem) {
            dupitem.push(arr[i]);
        }
    }
    return out;
}
const unique1=arr=>{
    if (!arr||!arr.length)return [];
    arr.sort(alphabetically1);
    const out=[arr[0]];
    for (let i=1;i<arr.length;i++) {
        if (arr[i][1]!==arr[i-1][1]) {
            out.push(arr[i])
        }
    }
    return out;
}
const unique0=arr=>{
    arr.sort(alphabetically0);
    const out=[arr[1]];
    for (let i=1;i<arr.length;i++) {
        if (arr[i][0]!==arr[i-1][0]) {
            out.push(arr[i])
        }
    }
    return out;
}
const statStrIntobject=o=>{
    const out=[];
    for (const key in o) {
        out.push([o[key],key]);
    }
    out.sort((a,b)=>b[0]-a[0]);
    return out;
}
const fromObj=(obj,cb=null)=>{
    const arr=[];
    for (let key in obj) {
        if (!cb) {
            arr.push(key+'\t'+obj[key] );
        } else {
            arr.push( cb(key,obj[key]) );
        }
    }
    return arr;
}

const fillGap=sorted_int_array=>{
    let prev=sorted_int_array[0]||0;
        
    for (let i=1;i<sorted_int_array.length;i++) { //fill the gap
        if (isNaN(sorted_int_array[i])) sorted_int_array[i]=prev;
        prev=sorted_int_array[i];
    }
    return sorted_int_array;
}
export {unique,unique1,unique0,fromObj,fillGap,
    alphabetically, alphabetically1,alphabetically2,alphabetically0,
    length_alphabetically,length_alphabetically0,length_alphabetically1,
    statStrIntobject};