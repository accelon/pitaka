// const maxlen1=91
// const maxlen2=91*91	   //8281
// const maxlen3=91*91*91 //753571
export const maxlen1=109
export const maxlen2=109*109	   //11881
export const maxlen3=109*109*109 //1295029
export const CodeStart=0x0E;

export const unpack3=str=>{
	const arr=[];
	let i1,i2,i3;
	const count=Math.floor(str.length/3);
	for (let i=0;i<count;i++) {
		i3=str.charCodeAt(i*3) -CodeStart;
		i2=str.charCodeAt(i*3+1) -CodeStart;
		i1=str.charCodeAt(i*3+2) -CodeStart;
		arr.push( maxlen1*maxlen1*i3 +maxlen1*i2+i1 );
	}
	return new Int32Array(arr);
}
export const unpack2=str=>{
	const arr=[];
	let i1,i2;
	const count=Math.floor(str.length/2);
	for (let i=0;i<count;i++) {
		i2=str.charCodeAt(i*3) -CodeStart;
		i1=str.charCodeAt(i*3+1) -CodeStart;
		arr.push(maxlen1*i2+i1 );
	}
	return new Int32Array(arr);
}
export const unpack1=str=>{
	const arr=[];
	let i1;
	const count=Math.floor(str.length);
	for (let i=0;i<count;i++) {
		i1=str.charCodeAt(i*3) -CodeStart;
		arr.push( i1 );
	}
	return new Int32Array(arr);
}
//letiable  1or 3 bytes, maxlen2
export const unpack=str=>{
	const arr=[];
	let o,i=0;
	while (i<str.length) {
		o=str.charCodeAt(i) -CodeStart;
		if ( str[i]=='{' ) { // unpack2
			o=(str.charCodeAt(i+1)-CodeStart)*maxlen1
			+(str.charCodeAt(i+2)-CodeStart);
			i+=2;
		} else if (str[i]=='}') { // unpack3
			o=(str.charCodeAt(i+1)-CodeStart)*maxlen1*maxlen1
			+(str.charCodeAt(i+2)-CodeStart)*maxlen1
			+(str.charCodeAt(i+3)-CodeStart);
			i+=3;
		}
		arr.push(o);
		i++;
	}
	return new Int32Array(arr);
}


export const unpack_delta=s=>{
	const arr=unpack(s);
	if (arr.length<2)return arr;
	for (let i=1;i<arr.length;i++) {
		arr[i]+=arr[i-1];
	}	
	return new Int32Array(arr);
}

export const unpack_delta2d=s=>{
	if (!s)return [];
	const arr2d=unpack2d(s);
	if (arr2d.length==1) {
		return [unpack_delta(s)];
	}
	return arr2d.map( arr=> {
		if (arr.length<2)return arr;
		for (let i=1;i<arr.length;i++) {
			arr[i]+=arr[i-1];
		}	
		return new Int32Array(arr);
	});
}

export const unpack2d=s=>{
	if (!s)return [];
	const arr=s.split("|");
	if (arr.length==1) return [unpack(arr[0])];
	return arr.map(itm=>unpack(itm));
}
export const unpack3_2d=s=>{
	if (!s)return [];
	const arr=s.split("|");
	if (arr.length==1) return [unpack3(arr[0])];
	return arr.map(itm=>unpack3(itm));
}
