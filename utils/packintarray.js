import {maxlen1,maxlen2,maxlen3,CodeStart, SEPARATOR2D,
	BYTE_MAX,BYTE1_MAX, BYTE2_MAX,BYTE3_MAX, BYTE4_MAX,BYTE2_START,BYTE3_START,BYTE4_START} from './unpackintarray.js';
export const pack1=(arr,esc)=>{
	let s="";
	for (let i=0;i<arr.length;i++) {
		if (arr[i]>=maxlen1) throw new Error("exit boundary "+arr[i])
		let int=arr[i];
		if (isNaN(int)) int=0;
		s+=String.fromCharCode(int+CodeStart);
	}
	if (esc) s=escapePackedStr(s); 
	return s;
}
export const pack2=(arr,esc=false)=>{
	let s="";
	for (let i=0;i<arr.length;i++) {
		if (arr[i]>=maxlen2) {
			throw new Error("exit boundary "+arr[i])
		}
		let int=arr[i];
		if (isNaN(int)) int=0;
		let i1,i2;
		i1=int % maxlen1;
		int=Math.floor(int/maxlen1);
		i2=int % maxlen1;
		s+=String.fromCharCode(i2+CodeStart)+String.fromCharCode(i1+CodeStart);
	}
	if (esc) s=escapePackedStr(s); 
	return s;
}
export const pack3=(arr,esc=false)=>{
	let s="";
	for (let i=0;i<arr.length;i++) {
		if (arr[i]>=maxlen3) throw "exit boundary "+arr[i]
		let int=arr[i];
		if (isNaN(int)) int=0;
		let i1,i2,i3;
		i1=int % maxlen1;
		int=Math.floor(int/maxlen1);
		i2=int % maxlen1
		i3=Math.floor(int/maxlen1);
		s+=String.fromCharCode(i3+CodeStart)+String.fromCharCode(i2+CodeStart)+String.fromCharCode(i1+CodeStart);
	}
	if (esc) s=escapePackedStr(s); 
	return s;
}


//might be two dimensional,separated by | 
export const pack2d=(arr,esc)=>{
	const o=[];
	for (let i=0;i<arr.length;i++) {
		o.push(pack(arr[i]||[],esc));
	}
	return o.join(SEPARATOR2D);
}
export const pack3_2d=(arr,esc)=>{
	const o=[];
	for (let i=0;i<arr.length;i++) {
		o.push(pack3(arr[i]||[],esc));
	}
	return o.join(SEPARATOR2D);
}
export const pack=(arr,esc)=>{
	let s="";
	for (let i=0;i<arr.length;i++) {
		let int=arr[i];
		if (isNaN(int)) new Error('not an integer at'+i);
		if (int<0) new Error('negative value at'+i+' value'+int);
		if (int<BYTE1_MAX) {			
			s+=String.fromCharCode(int+CodeStart);
		} else if (int<BYTE2_MAX) {
			int-=BYTE1_MAX;
			let i1,i2;
			i1=int % BYTE_MAX;
			i2=Math.floor(int/BYTE_MAX);
			s+=String.fromCharCode(i2+BYTE2_START+CodeStart)
			 +String.fromCharCode(i1+CodeStart);
		} else if (int<BYTE3_MAX) {
			int-=BYTE2_MAX;
			let i1,i2,i3;
			i1=int % BYTE_MAX;
			int=Math.floor(int/BYTE_MAX);
			i2=int % BYTE_MAX
			i3=Math.floor(int/BYTE_MAX);
			s+=String.fromCharCode(i3+BYTE3_START+CodeStart)
			+String.fromCharCode(i2+CodeStart)
			+String.fromCharCode(i1+CodeStart);
		} else if (i<BYTE4_MAX) {
			int-=BYTE3_MAX;
			let i1,i2,i3,i4;
			i1=int % BYTE_MAX;
			int=Math.floor(int/BYTE_MAX);
			i2=int % BYTE_MAX
			int=Math.floor(int/BYTE_MAX);
			i3=int % BYTE_MAX

			i4=Math.floor(int/BYTE_MAX);
			s+=String.fromCharCode(i4+BYTE4_START+CodeStart)
			+String.fromCharCode(i3+CodeStart)
			+String.fromCharCode(i2+CodeStart)
			+String.fromCharCode(i1+CodeStart);
		} else throw new Error('exist 4 byte boundary '+BYTE4_MAX);
	}
	if (esc) s=escapePackedStr(s); 
	return s;
}
export const pack_delta=(arr,removeRepeat=false)=>{
	if (arr.length<1)return "";
	if (!arr[0]) arr[0]=0;
	let now=arr[0];

	for (let i=1;i<arr.length;i++) {
		const p=arr[i];
		if (now>arr[i]) console.log("negative value",i,arr[i]);
		else if (removeRepeat&&arr[i]==0) arr[i]=Number.MIN_VALUE;

		arr[i]=arr[i]-now;
		now=p;
	}
	return pack(arr);
}

export const pack_delta2d=(arr2d,removeRepeat=false)=>{
	return arr2d.map(arr=>{
		if (arr.length<1)return "";
		if (!arr[0]) arr[0]=0;
		let now=arr[0];
		for (let i=1;i<arr.length;i++) {
			const p=arr[i];
			if (removeRepeat&&arr[i]==now) arr[i]=Number.MIN_VALUE;
			else if (now>arr[i]) {
				console.log("negative value at ",i,arr[i],"prev",now);
			}
			arr[i]=arr[i]-now;
			now=p;
		}
		return pack(arr);
	}).join("|");
}
export const arrDelta=arr=>{
	if (!arr)return [];
	if (arr.length===1) return [arr[0]]
	
	const out=[arr[0]];
	for (let i=1;i<arr.length;i++) {
		out.push( arr[i]-arr[i-1]);
	}
	return out;
}
export const escapeStrWithQuote=str=>str.replace(/"/g,'\\"');
export const escapePackedStr=str=>str.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/\$\{/g,'$\\{');
