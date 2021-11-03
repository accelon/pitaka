export const plFind=(arr, p, v)=>{
    let speed = 1;
    let p2 = p + speed;
    while (p2 < arr.length )  {
        if (arr[p2] < v) {
            speed++;
        } else  {
            if (speed <= 1) break;
            p2 -= speed;
            speed=1;
        }
        p2 += speed;
    }
    return p2;
}
export const plAnd=(arr1,arr2,dist=1)=>{
    let p1 = 0, p2 = 0;
    let out =[];

    while (p1 < arr1.length && p2 < arr2.length)  {
        var v1 = arr1[p1]+dist;
        let v2 = arr2[p2];
        if (v1>v2) {
            p2 = plFind(arr2, p2, v1);
        } else if (v2>v1) {
            p1 = plFind(arr1, p1, v2);
        } else {
            out.push(v1-dist);
            p1++;p2++;
        }
    }
    return out;
}



export default {plAnd,plFind}