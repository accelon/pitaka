import {pack3,unpack3} from './packintarray.js';
import {unpack3} from './unpackintarray.js'
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