// This code is contributed by _saurabh_jaiswal
//https://www.geeksforgeeks.org/fibonacci-search/
export const fibSearch=(arr, x, n)=>{ // Returns index of x if present, else returns -1
    if (typeof n=='undefined') n=arr.length;
    let fibMMm2 = 0; // (m-2)'th Fibonacci No.
    let fibMMm1 = 1; // (m-1)'th Fibonacci No.
    let fibM = fibMMm2 + fibMMm1; // m'th Fibonacci

    while (fibM < n)  {
        fibMMm2 = fibMMm1;
        fibMMm1 = fibM;
        fibM = fibMMm2 + fibMMm1;
    }
    let offset = -1;
    while (fibM > 1)  { // Check if fibMm2 is a valid location
        let i = Math.min(offset + fibMMm2, n-1);
        if (arr[i] < x)  {
            fibM = fibMMm1;
            fibMMm1 = fibMMm2;
            fibMMm2 = fibM - fibMMm1;
            offset = i;
        }
        else if (arr[i] > x)  {
            fibM = fibMMm2;
            fibMMm1 = fibMMm1 - fibMMm2;
            fibMMm2 = fibM - fibMMm1;
        }
        else return i;
    }
    return n //return the closest match
    //if(fibMMm1 && arr[n-1] == x) return n-1
    //return -1;
}
export const fibIntersect=(arr1,arr2)=>{
  if (arr1.length>arr2.length) {
    [arr1,arr2]=[arr2,arr1]
  }
  const out=[];
  for (let i=0;i<arr1.length;i++) {
    const v=arr1[i];

    const at=fibSearch(arr2,v);
    if (v==0x674f) {//26447
      console.log('杏',at,arr2[at],arr2[0])
    }
    if (arr2[at]==v) out.push(v);
  }
  return out;
}