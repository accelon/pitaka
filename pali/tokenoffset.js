/* assuming space as delimiter
   new offset is the begining of closest corresponding token
*/
export const calOriginalOffset=(offset, screentext, oritext )=>{
	if (!oritext|| screentext===oritext) return offset;
	const tokens1=screentext.trim().split(/( +)/);
	const tokens2=oritext.trim().split(/( +)/);
	if (tokens1.length!==tokens2.length) {
		console.warn('screen text is not converted from oritext',screentext,oritext);
		return offset;
	}
	let acc1=0,acc2=0,i=0;
	while (i<tokens1.length) {
		acc1+=tokens1[i].length;
		acc2+=tokens2[i].length;
		if (tokens1[i][0]!==' ' && acc1>offset) return acc2;
		i++;
	}
	return offset;
}