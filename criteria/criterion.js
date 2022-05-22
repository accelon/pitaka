/* inherit class must prefix with Criterion_ */
export default class Criterion {
	constructor (opts){
		this.ptk=opts.ptk;
		this.label=opts.label;
		this.query='';
		this.result=null;
	}
	async exec (tofind,opts){
		throw "not implemented!"
	}
}