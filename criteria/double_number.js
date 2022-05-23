import Criterion from './criterion.js'
import {unique} from '../utils/sortedarray.js'
import {bsearch} from '../utils/bsearch.js'
export default class Criterion_double_number extends Criterion{
	async exec (query,opts){
		let linepos=[],chunks=[];
		const ptk=this.ptk;
		query=query.trim();
		if (query!==this.query) {
			const {nums,lineposs}=this.label;
			if (query.indexOf('~')==-1) {
				const at=bsearch(nums, parseInt(query));
				if (at>-1) {
					linepos=lineposs[at];
					chunks= unique(linepos.map( y=>ptk.chunkOf( y,true)),true);
				}
			} else {
				let [from,to]=query.split('~');
				from=parseInt(from);
				to=parseInt(to);
				for (let i=0;i<nums.length;i++) {
					const num=nums[i];
					let m;
					if (from && to) {
						m=(num>=from && num<=to);
					} else if (from) { //
						m=num>=from;
					} else if (to) {
						m=num<=to;
					}
					if (m) linepos=linepos.concat(Array.from(lineposs[i]));
				}
				linepos.sort((a,b)=>a-b);
				chunks= unique(linepos.map( y=>ptk.chunkOf( y,true)),true);
			}
			this.query=query;
			this.result={chunks, linepos};
		}
		return this.result;
	}
}