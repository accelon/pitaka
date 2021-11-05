let counter=0,maxspeed=0;
/*inspired by https://github.com/Siderite/SortedArrayIntersect AcceleratingIntersercter*/
export const plFind=(arr, v, p=0)=>{
    let speed = 1;
    let p2 = p;
    while (p2 < arr.length )  {
        if (v>arr[p2]) {
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

export const plAnd=(pl1,pl2,dist=1)=>{
    let p1 = 0, p2 = 0 , c=0;
    if (pl1.length==0 ||pl2.length==0) return [];
    const sz=Math.min(pl1.length,pl2.length);
    let out=new Int32Array(sz);

    while (p1 < pl1.length && p2 < pl2.length)  {
        var v1 = pl1[p1]+dist;
        let v2 = pl2[p2];
        if (v1>v2) {
            p2 = plFind(pl2, v1, p2);
        } else if (v2>v1) {
            p1 = plFind(pl1, v2, p1);
        } else {
            out[c++]=v1-dist;
            p1++;p2++;
        }
    }
    return new Int32Array( out.slice(0,c));
}
export const plCount=(pl,plgroup)=>{
    let p=0,start=0,end=0;
    const out=[];
    for (let i=0;i<plgroup.length;i++) {
        const [from,to]=plgroup[i];
        start=p;
        if (from>pl[p]) start=plFind(pl,from,p);
        end=start;
        while (pl[end]<to && end<pl.length) end++; 
        if (end>start) {
            out.push([i,end-start]) ;
        }
        p=end;
    }
    return out;
}
//calculate the contribution of each token by length of posting
//all tokens sum up to 1
export const weightToken=tokens=>{ //array of {token, posting=[] }
    const totalfreq=tokens.reduce((p,v)=>p+v.posting.length,0);
    const arr=tokens.map(it=> [it.token,Math.log(totalfreq/it.posting.length)  , it.posting]);
    const min=0.9/tokens.length;
    const totalweight=arr.reduce((p,v)=>p+v[1],0);
    //remove common characters
    let out=arr.map(it=>[it[0], it[1]/totalweight, it[2]])
    if (out.length>10) out=out.filter(it=>it[1]>min);
    const totalweight2=out.reduce((p,v)=>p+v[1],0);
    out=out.map(it=>[it[0], it[1]/totalweight2,it[2] ]); //last item is current ptr
    return out;
}
export const scoreLines=weightToken=>{

}
export const getCounter=()=>counter;
export const getSpeed=()=>maxspeed;
export const resetCounter=()=>counter=0;
export default {plAnd,plFind,getCounter,resetCounter,weightToken,scoreLines}