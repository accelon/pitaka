import Criterion from './criterion.js'
import {bsearch} from '../utils/bsearch.js'
export default class Criterion_substring extends Criterion{
	async exec (query,opts={}){
		const lang=opts.lang||this.ptk.header.lang;
		const ignorecase=lang=='en';
		query=query.trim();
		let reg;
		if (ignorecase && isNaN(parseInt(query)) ) {
			reg=new RegExp(query.toLowerCase(),'i');
		}
		if (query!==this.query) {
			const {linepos,names,caption,idarr}=this.label;
	        const chunks=[];
			if (parseInt(query).toString()==query) {
				const at=idarr.indexOf(query); 
				if (~at)  chunks.push( at );//only one item , basket/criteria.js::cascadeCriteria stop intersection 
			} else {
				for (let i=0;i<names.length;i++) {
					if (ignorecase) {
						names[i].match(reg) && chunks.push(i);
					} else {
						~names[i].indexOf(query) && chunks.push(i);							
					}
				}
			}
	        this.query=query;
	        this.result={ query, caption,count:chunks.length, chunks};
		}
		return this.result;
	}
}