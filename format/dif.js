/* convert Data-inter-Change format to tabular JSON */

export const fromDIF=lines=>{
	const out=[];
	console.log(lines.slice(0,10))
	if (lines[0]!=='TABLE') {
		throw 'not an DIF';
	}
	const vectors=parseInt(lines[4].split(',')[1]);
	const tuples=parseInt(lines[7].split(',')[1]);
	let cell='';
	let row=[],i=14,multiline=false;
	while ( i<lines.length) {
		let line=lines[i];
		if (multiline) {
			const ends=line.endsWith('"');
			if (ends) {
				cell+='\n'+line.slice(0,line.length-1);
				row.push(cell);
				multiline=false;
			} else {
				cell+=line;
			}
			i++;
			continue;
		}

		if (line==='-1,0') { //end of row
			out.push(row);
			row=[];
		} else if (line=='1,0' || line.slice(0,2)=='0,') {
			const [datatype,value]=line.split(',');
			// console.log('datatype',datatype,value)
			if (datatype=='0' && lines[i+1]=='V') {
				row.push(parseInt(value));
			} else if (datatype==='1') {
				i++;
				line=lines[i];
				const starts=line.startsWith('"');
				const ends=line.endsWith('"');
				if (starts && ends) {
					row.push(line.slice(1,line.length-1));
					cell='';
				} else if (starts) {
					cell=line.slice(1);
					multiline=true;
				} else {
					throw "wrong data line"+(i+1)+ ' '+line;
				}
			}
		}
		i++;
	}
	return out;
}