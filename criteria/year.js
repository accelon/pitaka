import Criterion from './criterion.js'
import {unique} from '../utils/array.js'
import {bsearch} from '../utils/bsearch.js'
export default class Criterion_year extends Criterion{
	async exec (query,opts){
		let linepos=[],chunks=[];
		const ptk=this.ptk;
		if (query!==this.query) {
			const {years,lineposs}=this.label;
			if (query.indexOf('~')==-1) {
				const at=bsearch(years, parseInt(query));
				if (at>-1) {
					linepos=lineposs[at];
					chunks= unique(linepos.map( y=>ptk.chunkOf( y,true)));
				}
			} else {
				let [from,to]=query.split('~');
				from=parseInt(from);
				to=parseInt(to);
				for (let i=0;i<years.length;i++) {
					const year=years[i];
					let m;
					if (from && to) {
						m=(year>=from && year<=to);
					} else if (from) { //
						m=year>=from;
					} else if (to) {
						m=year<=to;
					}
					if (m) linepos=linepos.concat(Array.from(lineposs[i]));
				}
				linepos.sort((a,b)=>a-b);
				chunks= unique(linepos.map( y=>ptk.chunkOf( y,true)));
			}
			this.result={chunks, linepos};
		}
		return this.result;
	}
}