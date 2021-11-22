import {pack3,pack, pack_delta} from './packintarray.js';
import {unpack3,unpack,unpack_delta,maxlen3,
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
import {writeFileSync} from 'fs'
const test_newpack=()=>{
	const s=pack([1,143,261,379,553,654,721,832,931,994,1155,1228,1335,1463,1511,1647,1802,1994,2058,2162,2225,2307,2365,2448,2486,2521,2541,2634,2686,2760,2843,2908,2958,3016,3050,3109,3133,3164,3178,3200,3237,3278,3364,3411,3512,3679,3774,3845,3865,3914,3972,4007,4098,4168,4215,4245,4300,4350,4400,4446,4483,4524,4568,4612,4654,4706,4764,4802,4859,4891,4928,4979,5022,5060,5090,5138,5186,5225,5280,5317,5406,5500,5613,5743,5850,5976,6123,6240,6370,6511,6668,6782,6858,6927,7008,7070,7194,7270,7403,7529,7632,7721,7791,7895,8044,8135,8242,8335,8430,8577,8687,8797,8918,9073,9151,9269,9427,9559,9692,9771,9886,9956,10041,10185,10279,10366,10442,10526,10645,10760,10832,10918,11020,11089,11295,11383,11461,11588]);
	console.log(s.length)
	console.log(unpack(s).join(','));
}
// test_pack();
// testpacki()
// test_pack();
// testunpacki()
test_newpack();
