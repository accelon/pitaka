import Criterion from './criterion.js'

export default class Criterion_substring extends Criterion{
	async exec (query,opts={}){
		const lang=opts.lang||this.ptk.header.lang;
		query=query.trim();
		if (query!==this.query) {
			const {linepos,names,idarr,caption}=this.label;
	        const chunks=[];
	        for (let i=0;i<names.length;i++) {
	            const at=names[i].indexOf(query);
	            if (at>-1) {
	                chunks.push(linepos[i]);
	            }
	        }
	        this.query=query;
	        this.result={ query, caption:caption,count:chunks.length, chunks};
			console.log('run substring',query, this.result.count)
		}
		return this.result;
	}
}