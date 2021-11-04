let counter=0,maxspeed=0;
/*inspired by https://github.com/Siderite/SortedArrayIntersect AcceleratingIntersercter*/
export const plFind=(arr, p, v)=>{
    let speed = 1;
    let p2 = p + speed;
    while (p2 < arr.length )  {
        if (arr[p2] < v) {
            speed++;
            if (speed>maxspeed)maxspeed=speed;
        } else  {
            if (speed <= 1) break;
            p2 -= speed;
            speed=1;
        }
        p2 += speed;
        counter++
    }
    return p2;
}

export const plAnd=(arr1,arr2,dist=1)=>{
    let p1 = 0, p2 = 0 , c=0;
    if (arr1.length==0 ||arr2.length==0) return [];
    const sz=Math.min(arr1.length,arr2.length);
    let out=new Uint32Array(sz);

    while (p1 < arr1.length && p2 < arr2.length)  {
        var v1 = arr1[p1]+dist;
        let v2 = arr2[p2];
        if (v1>v2) {
            p2 = plFind(arr2, p2, v1);
        } else if (v2>v1) {
            p1 = plFind(arr1, p1, v2);
        } else {
            out[c++]=v1-dist;
            p1++;p2++;
        }
    }
    return new Uint32Array( out.slice(0,c));
}

export const getCounter=()=>counter;
export const getSpeed=()=>maxspeed;
export const resetCounter=()=>counter=0;
export default {plAnd,plFind,getCounter,resetCounter}