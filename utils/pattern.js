
export const glob=(files,filepat)=>{
    if (typeof files=='string') {
        files=fs.readdirSync(files);
    }
    if (!filepat) return files;
    const pat=filepat.replace(/\*/g,'[^\\.]+').replace(/\./g,'\\.').replace(/\?/g,'.');
    const reg=new RegExp(pat);
    return files.filter(f=>f.match(reg));
}

export function filesFromStringPattern(pat,rootdir){
    
    const outfiles={};
    const patterns=pat.split(/[;,]/);
    const folderfiles=fs.readdirSync(rootdir);
    patterns.forEach(pat=>{
        if (pat.indexOf('?')>-1 || pat.indexOf('*')>-1) {
            const files=glob(folderfiles,pat);
            files.forEach(f=>{
                outfiles[f]=true;
            })
        } else if (fs.existsSync(rootdir+pat)){
            outfiles[pat]=true;
        }
    });
    const out=Object.keys(outfiles);
    return out;
    /*

    if (pat.match(/[\\\?\*\[\+]/)) {
        const files=fs.readdirSync(rootdir);
        if (pat.indexOf('?')>-1 || pat.indexOf('*')>-1) {

        } else {
            const reg=new RegExp(pat);
            for (let i=0;i<files.length;i++) {
                if (files[i].match(reg)) {
                    out.push(files[i]);
                }
            }
            out.sort((a,b)=>a>b?1: ((a<b)?-1:0));    
        }
        return out;
    }

    if (pat.indexOf(';')>0 || pat.indexOf(',')>0) {
        out=pat.split(/[;,]/);
    } else {       
        const RANGE_REGEX=/\[(\d+):(\d+)\]/;
        const RANGE_REGEX_REPLACE=/(\[\d+:\d+\])/;
        const range=pat.match(RANGE_REGEX);
        if (range) {
            let [m,from,to]=range;
            from=parseInt(from),to=parseInt(to);
            for (let i=from ;i<=to;i++) {
                out.push(pat.replace(RANGE_REGEX_REPLACE,i));
            }
        } else {
            out=[pat];
        }
    }
    */
    return out;
}


export default {glob}