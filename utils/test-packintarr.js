import {packi,pack3,pack, pack_delta} from './packintarray.js';
import {unpacki,unpack3,unpack,unpack_delta,maxlen3,
	BYTE1_MAX,BYTE2_MAX,BYTE3_MAX,
	BYTE4_MAX,BYTE_MAX,CodeStart,
	BYTE2_START,BYTE3_START,BYTE4_START} from './unpackintarray.js';
const test_pack3=()=>{
	let arr=[];
	for (let i=100000;i< maxlen3-1000;i+=1000){
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
const test_pack=()=>{
	let arr=[];
	for (let i=0;i<1000;i++){
		const r=Math.round(Math.random()*5000);
		arr.push(r);
	}
	let s=pack(arr);
	let out=unpack(s);

	for (let i=0;i<out.length;i++) {
		if (out[i]!==arr[i]) {
			throw new Error("test fail at"+i)
		}
	}
	const arrlen=JSON.stringify(arr).length;
	console.log('ratio', s.length/arrlen, "arr length"+JSON.stringify(arr).length,"pack length"+s.length);
}

const testpacki=()=>{
	let test=0,pass=0;
	const s=packi([0,1,BYTE1_MAX-1]);
	s.length===3?pass++:0; test++;
	s.charCodeAt(0)==CodeStart?pass++:0; test++;
	s.charCodeAt(1)==CodeStart+1?pass++:0; test++;
	s.charCodeAt(2)==CodeStart+BYTE1_MAX-1?pass++:0; test++;

	const s2=packi([BYTE1_MAX,BYTE1_MAX+1]);
	s2.length===4?pass++:0; test++;

	s2.charCodeAt(0)==CodeStart+BYTE2_START?pass++:0; test++;
	s2.charCodeAt(1)==CodeStart?pass++:0; test++;
	s2.charCodeAt(2)==CodeStart+BYTE2_START?pass++:0; test++;
	s2.charCodeAt(3)==CodeStart+1?pass++:0; test++;

	
	const s3=packi([BYTE2_MAX-1,BYTE2_MAX]);
	s3.length===5?pass++:0; test++;
	s3.charCodeAt(0)==CodeStart+BYTE3_START-1?pass++:0; test++;
	s3.charCodeAt(1)==CodeStart+BYTE_MAX-1?pass++:0; test++;

	s3.charCodeAt(2)==CodeStart+BYTE3_START?pass++:0; test++;
	s3.charCodeAt(3)==CodeStart?pass++:0; test++;
	s3.charCodeAt(4)==CodeStart?pass++:0; test++;

	const s4=packi([BYTE3_MAX-1,BYTE3_MAX]);
	s4.length===7?pass++:0; test++;
	s4.charCodeAt(0)==CodeStart+BYTE4_START-1?pass++:0; test++;
	s4.charCodeAt(1)==CodeStart+BYTE_MAX-1?pass++:0; test++;
	s4.charCodeAt(2)==CodeStart+BYTE_MAX-1?pass++:0; test++;
	s4.charCodeAt(3)==CodeStart+BYTE4_START?pass++:0; test++;
	s4.charCodeAt(4)==CodeStart?pass++:0; test++;
	s4.charCodeAt(5)==CodeStart?pass++:0; test++;
	s4.charCodeAt(6)==CodeStart?pass++:0; test++;

	console.log('test',test,'pass',pass)
}
const testunpacki=()=>{
	let arr=[];
	for (let i=0;i<1000;i++){
		const r=Math.round(Math.random()*5000);
		arr.push(r);
	}
	let s=packi(arr);
	let out=unpacki(s);
	
	for (let i=0;i<out.length;i++) {
		if (out[i]!==arr[i]) {
			throw new Error("test fail at"+i)
		}
	}
	const arrlen=JSON.stringify(arr).length;
	console.log('ratio', s.length/arrlen, "arr length"+JSON.stringify(arr).length,"pack length"+s.length);

}
// test_pack();
// testpacki()
// test_pack();
testunpacki()