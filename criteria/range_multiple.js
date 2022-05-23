import Criterion from './criterion.js'
import {bsearch} from '../utils/bsearch.js'
import {unique} from '../utils/sortedarray.js'

export default class Criterion_range_multiple extends Criterion {
	async exec(query,opts={}){
		let chunks=[];
		const ck=this.ptk.getChunkLabel();
		query=query.trim();
		if (query!==this.query) {
			const {linepos}=this.label;
			const idarr=query.split(',');
			
			for (let i=0;i<idarr.length;i++) {			
				const id=parseInt(idarr[i])-1 ;//zero base
				const from=linepos[id];
				const to=linepos[id+1];
				if (!isNaN(from) && !isNaN(to)) {
					const at1=bsearch(ck.linepos , from,true);
					const at2=bsearch(ck.linepos , to,true);
					for (let j=at1;j<at2;j++) {
						chunks.push(j)
					}
				}
			}
			chunks=unique(chunks.sort((a,b)=>a-b),true);			
			this.query=query;
			this.result={chunks};
		}
		return this.result;
	}
}