const sameLeadingByte=(t,prev)=>{
  let m=0;
  for (let i=0;i<t.length&&i<prev.length;i++) {
      if (t[i]==prev[i]) m++
      else break;
  }
  return m;
}

const findn= (arr, obj, near,n) =>{
  let low = 0, high = arr.length-1, mid;
  while (low < high) {
    mid = (low + high) >> 1;
    if (arr[mid][n] === obj)  {
      while (mid>-1 &&arr[mid-1][n]===obj ) mid--; //值重覆的元素，回逆到第一個
      return mid;
    }
    (arr[mid][n] < obj) ? low = mid + 1 : high = mid;
  }

  if (near) {
    if (typeof obj=='string'){
      let same=sameLeadingByte( arr[low][n], obj);
      let newsame=low?sameLeadingByte( arr[low-1][n], obj):0;
      while (low>0&&newsame>=same) {
        if (low>0) newsame=sameLeadingByte( arr[low-1][n], obj); else break;
        if (newsame>=same) {
          same=newsame;low--; 
        } else break;
      }  
    }
    return low;
  }

  else if (arr[low][n] === obj) return low;
  else return -1;
}
const find = (arr, obj, near,n=-1) =>{
  if (n>-1) return findn(arr,obj,near,n);

  let low = 0, high = arr.length-1, mid;
  while (low < high) {
    mid = (low + high) >> 1;
    if (arr[mid] === obj)  {
      while (mid>-1 &&arr[mid-1]===obj ) mid--; //值重覆的元素，回逆到第一個
      return mid;
    }
    (arr[mid] < obj) ? low = mid + 1 : high = mid;
  }

  if (near) {
    if (typeof obj=='string'){
      let same=sameLeadingByte( arr[low], obj);
      let newsame=low?sameLeadingByte( arr[low-1], obj):0;
      while (low>0&&newsame>=same) {
        if (low>0) newsame=sameLeadingByte( arr[low-1], obj); else break;
        if (newsame>=same) {
          same=newsame;low--; 
        } else break;
      }  
    }
    return low;
  }

  else if (arr[low] === obj) return low;
  else return -1;
};



const find_getter =  (getter, obj, near) =>{ 
  const len=getter();
  let low = 0,high = len;
  while (low < high) {
    var mid = (low + high) >> 1;
    if (getter(mid)===obj) {
      while (mid>-1 &&getter(mid-1)===obj ) mid--; //值重覆的元素，回逆到第一個
      return mid<len?mid:len-1;
    }
    getter(mid)<obj ? low=mid+1 : high=mid;
  }
  if (near) return low<len?low:len-1;
  else if (getter(low)===obj) return low;else return -1;
}

export const bsearch=(array,value,near, n=-1)=> { //n>-1 , array second level  item index
	const func=(typeof array=="function")?find_getter:find;
	return func(array,value,near,n);
}

