/* assuming space as delimiter
   new offset is the begining of closest corresponding token
*/
export const calOriginalOffset=(offset, screentext, oritext )=>{
	if (!oritext|| screentext===oritext) return offset;
	let acc1=0,acc2=0,i=0;
	while (i<screentext.length && screentext[i]==' ') { //work around for leading space
		i++;acc1++;
		screentext=screentext.slice(i);
	}
	i=0;
	while (i<oritext.length && oritext[i]==' ') { //work around for leading space
		i++;acc2++;
		oritext=oritext.slice(i);
	}


	const tokens1=screentext.split(/([A-Za-zṭṣñṅṛāīūḍḷṃ]+)/);
	const tokens2=oritext.split(/([A-Za-zṭṣñṅṛāīūḍḷṃ]+)/);
	if (tokens1.length!==tokens2.length) {
		console.warn('screen text is not converted from oritext',screentext,oritext);
		return offset;
	}
	i=0;
	while (i<tokens1.length) {
		acc1+=tokens1[i].length;
		acc2+=tokens2[i].length;
		if (tokens1[i]&&tokens1[i].match(/^[A-Za-z]/) && acc1>offset) {
			acc2-=tokens2[i].length;
			return acc2;
		}
		i++;
	}
	return offset;
}