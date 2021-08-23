import {maxlen1,maxlen2,maxlen3,CodeStart} from './unpackintarray.js';
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
	return o.join("|");
}

export const pack=(arr,esc)=>{
	let s="";
	for (let i=0;i<arr.length;i++) {
		if (arr[i]==Number.MIN_VALUE) continue;
		else if (arr[i]<0) {
			throw new Error("negative value "+arr[i]+" at"+i);
		}
		if (arr[i]>=maxlen1) {
			if (arr[i]<maxlen2) {
				s+="{"+pack2([arr[i]]);
			} else if (arr[i]>=maxlen2 && arr[i]<maxlen3) {
				s+="}"+pack3([arr[i]]);
			} else {
				throw new Error("exist boundarr pack "+arr[i]);
			}
			continue;
		}

		let int=arr[i];
		if (isNaN(int)) int=0;
		s+=String.fromCharCode(int+CodeStart);
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
		arr[i]=arr[i]-now;
		if (arr[i]<0) console.log("negative value",i,arr[i]);
		else if (removeRepeat&&arr[i]==0) arr[i]=Number.MIN_VALUE;
		now=p;
	}
	return pack(arr);
}

const pack_delta2d=(arr2d,removeRepeat=false)=>{
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

export const escapeStrWithQuote=str=>str.replace(/"/g,'\\"');
export const escapePackedStr=str=>str.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/\$\{/g,'$\\{');
