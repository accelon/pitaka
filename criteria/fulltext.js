import Criterion from './criterion.js'
import { parseQuery,plRanges,TOFIND_MAXLEN,scoreLine } from "../search/index.js";
import {union} from "../utils/array.js";

export default class Criterion_FullTextSearch extends Criterion {
	async exec(query,opts={}){
		if (query===this.query) {
			if (this.result && !this.result.scores && opts.scoring) {
				this.scoring();
			}
			console.log('use fulltextsearch result cache')
			return this.result;
		}
	    const ptk=this.ptk;

	    if (!ptk.inverted) await ptk.setupInverted();
		if (!ptk.inverted) return null;
	    
	    query=query.slice(0,TOFIND_MAXLEN);
	    const [phrases,postings]=await parseQuery(ptk,query,opts);
	    const chunks=postings.map( pl=>ptk.chunkWithPosting(pl) ).reduce( (acc,n)=>union(acc,n) , 0);
	    
	    const count=postings.reduce((acc,n)=>acc+n.length,  0);
	    this.result={query,caption:'內文',postings ,phrases , count, chunks}
		this.query=query;

		if (opts.scoring) this.scoring();
		console.log('run full text',query,'chunks',chunks.length)
	    return this.result;
	}
	scoring(){
		const chunklinepos=this.ptk.getChunkLabel().linepos
		const ltp=this.ptk.inverted.linetokenpos;
		this.result.scores=scoreLine(this.result.postings, ltp,chunklinepos);
		this.result.matches=this.result.scores.map(([line,scored])=>line).sort((a,b)=>a-b);
	}
	scoredChunk(ck){
		/*
		if (this.result && this.result.postings.length && !this.scores) {
			this.scoring();
		}
		const out=[];
		for (let i=0;i<this.scoredLine.length;i++) {
			if (this.scores[i][0]==ck) {
				return {score:this.scoreds[i][1], postings};//the score
			}
		}
		return {score:0};
		*/
	}
}
