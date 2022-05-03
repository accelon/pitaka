import {parseLex,orthOf,LEX_REG_G} from 'provident-pali' 

const markupLex=(lex,showlexeme)=>{
	let s='',left,right;
	for (let i=1;i<lex.length/2;i+=2) {
		left=lex[i-1],right=lex[i+1];
		let leftpart='',rightpart='';
		let at1=left.indexOf('<');
		let at2=right.indexOf('>');
		if (at1>-1) {
			leftpart=left.slice(at1+1);
			left=left.slice(0,at1);
		}
		if (at2>-1) {
			rightpart=right.slice(0,at2);
			lex[i+1]=right.slice(at2+1);
		}
		const sep=showlexeme?'⧘':'⦙';
		const s1=lex[i];
		const s2=leftpart+sep+rightpart;
		s+=left+'^'+(showlexeme?'p':'')+'sandhi[repl="'+(showlexeme?s1:s2)+'" '+ (showlexeme?s2:s1) +']';
	}
	s+=lex[lex.length-1];
	return s;
}
export const factorizeText=(str, mode , palitrans) =>{
	return str.replace(LEX_REG_G,(m,m1,idx)=>{
		if (m1.length<4 || str[idx-1]==='#'||str[idx-1]==='^') return m1;
		const lex=parseLex(m1);
		if (palitrans) return mode?m1.replace(/\d+/g,'-'):orthOf(lex);nod
		return markupLex(lex,mode,palitrans);
	})
}
export default {factorizeText}