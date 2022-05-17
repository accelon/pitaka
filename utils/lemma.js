import {bsearch} from './bsearch.js';
import {isSurrogate} from './cjk.js';
import {samecount} from 'provident-pali'
export const removeLemma=(line,lemmas)=>{
	let out='',i=0;
	while (i<line.length) {
		const sub=line.slice(i);
		const at=bsearch(lemmas,line.slice(i) , true);
		if (at<1) {
			let adv=isSurrogate(line)?2:1;
			out+=line.slice(i,i+adv);
			i+=adv;
		} else {
			let same=samecount(sub,lemmas[at]);
			if (same<2) {
				out+=line.slice(i,i+1);
				i+=1;
			} else {
				out+=' ';
				i+=same;
			}
		}
	}
	return out;
}