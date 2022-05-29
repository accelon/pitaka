import Criterion from './criterion.js'
import {bsearch,isSimpleRegEx} from '../utils/index.js'
export default class Criterion_entry extends Criterion{
	async exec (query,opts={}){

		const lang=opts.lang||this.ptk.header.lang;
		const ignorecase=lang=='en';
		query=query.trim();
		let reg;
		if ( (ignorecase||isSimpleRegEx(query)) && isNaN(parseInt(query)) ) {
			reg=new RegExp(query.toLowerCase(),'i');
		}

		if (query!==this.query) {
			const {linepos,names,caption,idarr}=this.label;
	        const chunks=[];

			if (query[0]=='^' && !reg) {
				const q=query.slice(1);
				let at=bsearch(names,q,true);
				if (at>0) {
					while (at<names.length-1) {
						if (names[at].slice(0,q.length)===q) chunks.push(at);
						else break;
						at++;
					}
				}
			} else {
				if (parseInt(query).toString()==query) {
					const at=idarr.indexOf(query); 
					if (~at)  chunks.push( at );//only one item , basket/criteria.js::cascadeCriteria stop intersection 
				} else {
					for (let i=0;i<names.length;i++) {
						if (reg) {
							names[i].match(reg) && chunks.push(i);
						} else {
							~names[i].indexOf(query) && chunks.push(i);							
						}
					}
				}				
			}

	        this.query=query;
	        this.result={ query, caption,count:chunks.length, chunks};
		}
		return this.result;
	}
}