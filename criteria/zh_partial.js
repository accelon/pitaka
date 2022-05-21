import Criterion from './criterion.js'

export default class Criterion_zh_partial extends Criterion{
	async exec (query,opts){
		if (query!==this.query) {
			const {linepos,names,idarr,caption}=this.label;
	        const matches=[],chunks=[];
	        for (let i=0;i<names.length;i++) {
	            const at=names[i].indexOf(query);
	            if (at>-1) {
	                matches.push(linepos[i]);
	            }
	        }
	        this.result={ query, caption:caption, matches, count:matches.length};
			console.log('run zh partial',query, this.result.count)
		}
		return this.result;
	}
}