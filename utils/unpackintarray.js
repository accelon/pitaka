export const maxlen1=113
export const maxlen2=113*113	   //12769
export const maxlen3=113*113*113 //1442897

export const CodeStart=0x0E;

export const BYTE_MAX=113;
export const BYTE1_MAX=45                                       //delta
export const BYTE2_MAX=44*BYTE_MAX+BYTE1_MAX                     //5017      //for year bc 2000~ad2280
export const BYTE2_START=45;    
export const BYTE3_START=89;         
export const BYTE4_START=105;         
export const BYTE5_START=112;
export const BYTE3_MAX=16*BYTE_MAX*BYTE_MAX+BYTE2_MAX                     // ~204304     
export const BYTE4_MAX=6 *BYTE_MAX*BYTE_MAX*BYTE_MAX+BYTE3_MAX            // ~10100279   
export const BYTE5_MAX=2 *BYTE_MAX*BYTE_MAX*BYTE_MAX*BYTE_MAX+BYTE4_MAX  // 326094722
export const SEP2DITEM=0x7f
export const SEPARATOR2D="\u007f"

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
export const unpack=s=>{
	const arr=[];
	let o,i=0;
	while (i<s.length) {
		o=s.charCodeAt(i) - CodeStart;
		if (o<BYTE2_START) {
			//single byte
		} else if (o<BYTE3_START) {
			const i1=s.charCodeAt(++i) - CodeStart;
			o-=BYTE2_START;
			o = o*BYTE_MAX + i1 + BYTE1_MAX;
		} else if (o<BYTE4_START) {
			const i2=s.charCodeAt(++i) - CodeStart;
			const i1=s.charCodeAt(++i) - CodeStart;
			o-=BYTE3_START;
			o = o*BYTE_MAX*BYTE_MAX + i2*BYTE_MAX + i1 + BYTE2_MAX ;
		} else if (o<BYTE5_START) {
			const i3=s.charCodeAt(++i) - CodeStart;
			const i2=s.charCodeAt(++i) - CodeStart;
			const i1=s.charCodeAt(++i) - CodeStart;
			o-=BYTE4_START;
			o = o*BYTE_MAX*BYTE_MAX*BYTE_MAX + i3*BYTE_MAX*BYTE_MAX + i2*BYTE_MAX + i1+BYTE3_MAX ;		
		} else if (o<SEP2DITEM) {
			const i4=s.charCodeAt(++i) - CodeStart;
			const i3=s.charCodeAt(++i) - CodeStart;
			const i2=s.charCodeAt(++i) - CodeStart;
			const i1=s.charCodeAt(++i) - CodeStart;
			o-=BYTE5_START;
			o = o*BYTE_MAX*BYTE_MAX*BYTE_MAX*BYTE_MAX
			+ i4*BYTE_MAX*BYTE_MAX*BYTE_MAX+i3*BYTE_MAX*BYTE_MAX 
			+ i2*BYTE_MAX + i1+BYTE3_MAX ;		
		} else {
			throw new Error("exit max integer 0x7f,"+ o);
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
	const arr=s.split(SEPARATOR2D);
	if (arr.length==1) return [unpack(arr[0])];
	return arr.map(itm=>unpack(itm));
}
export const unpack3_2d=s=>{
	if (!s)return [];
	const arr=s.split(SEPARATOR2D);
	if (arr.length==1) return [unpack3(arr[0])];
	return arr.map(itm=>unpack3(itm));
}
