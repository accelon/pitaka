// const maxlen1=91
// const maxlen2=91*91	   //8281
// const maxlen3=91*91*91 //753571
const maxlen1=109
const maxlen2=109*109	   //11881
const maxlen3=109*109*109 //1295029
const CodeStart=0x0E;
const pack1=(arr,esc)=>{
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
const pack2=(arr,esc=false)=>{
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
const pack3=(arr,esc=false)=>{
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

const unpack3=str=>{
	let arr=[],i1,i2,i3;
	const count=Math.floor(str.length/3);
	for (let i=0;i<count;i++) {
		i3=str.charCodeAt(i*3) -CodeStart;
		i2=str.charCodeAt(i*3+1) -CodeStart;
		i1=str.charCodeAt(i*3+2) -CodeStart;
		arr.push( maxlen1*maxlen1*i3 +maxlen1*i2+i1 );
	}
	return arr;
}
const unpack2=str=>{
	let arr=[],i1,i2;
	const count=Math.floor(str.length/2);
	for (let i=0;i<count;i++) {
		i2=str.charCodeAt(i*3) -CodeStart;
		i1=str.charCodeAt(i*3+1) -CodeStart;
		arr.push(maxlen1*i2+i1 );
	}
	return arr;
}
const unpack1=str=>{
	let arr=[],i1;
	const count=Math.floor(str.length);
	for (let i=0;i<count;i++) {
		i1=str.charCodeAt(i*3) -CodeStart;
		arr.push( i1 );
	}
	return arr;
}
//letiable  1or 3 bytes, maxlen2
const unpack=str=>{
	let arr=[],o,i=0;

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
	return arr;
}

//might be two dimensional,separated by | 
const pack2d=(arr,esc)=>{
	const o=[];
	for (let i=0;i<arr.length;i++) {
		o.push(pack(arr[i]||[],esc));
	}
	return o.join("|");
}
const unpack2d=s=>{
	if (!s)return [];
	const arr=s.split("|");
	if (arr.length==1) return [unpack(arr[0])];
	return arr.map(itm=>unpack(itm));
}

const pack=(arr,esc)=>{
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

const pack_delta=(arr,removeRepeat=false)=>{
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
const unpack_delta=s=>{
	const arr=unpack(s);
	if (arr.length<2)return arr;
	for (let i=1;i<arr.length;i++) {
		arr[i]+=arr[i-1];
	}	
	return arr;
}

const unpack_delta2d=s=>{
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
		return arr;
	});
}
const test=()=>{
	let arr=[];
	for (i=100000;i< maxlen3-1000;i+=1000){
		arr.push(i);
	}
	let s=pack3(arr);
	let out=unpack3(s);
	
	for (let i=0;i<out.length;i++) {
		if (out[i]!==arr[i]) {
			throw new Error("test fail at"+i)
		}
	}
	console.log("arr length"+JSON.stringify(arr).length)
	console.log("pack length"+s.length)
}

/*
if (typeof process!=="undefined" && process.argv.length==2){
	const arr=[90,91,92,93];
	const s=pack(arr);
	arr2=unpack(s);
	console.log(arr,arr2)
}
*/
//729,000


const escapePackedStr=str=>str.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/\$\{/g,'$\\{');
export {
	pack1,pack2,pack3,unpack3,unpack1,unpack2,
	unpack,pack,unpack2d,pack2d,escapePackedStr,
	pack_delta,unpack_delta,pack_delta2d,unpack_delta2d
}