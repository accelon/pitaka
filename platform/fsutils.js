import {PITAKA_EXT} from './constants.js'
export const findPitakaFolder=name=>{

    if (typeof global=='undefined') return "";
    if (! 'fs' in global) return;
    let pth=process.cwd();
    const sep=global.Path.sep;
    const nameprefix=name.replace(/\-.+/,'');
    while (pth) {
        const fn=pth+sep+name+PITAKA_EXT;        
        const fnfn=pth+sep+name+sep+name+PITAKA_EXT;        
        const js000=pth+sep+name+sep+'000.js'
        const fnjs000=pth+sep+name+sep+name+sep+'000.js';

        const prefixfnjs000=pth+sep+nameprefix+sep+name+sep+'000.js';

        if (fs.existsSync(js000)){
            return pth+sep;
        } else if (fs.existsSync(fnjs000)) {
            return pth+sep+name+sep;
        } else if (fs.existsSync(prefixfnjs000)) {
            return pth+sep+nameprefix+sep;
        } else if (fs.existsSync(fn)) {
            return fn;
        } else if (fs.existsSync(fnfn)) {
            return fnfn;
        }
        
        const newpth=Path.resolve(pth,'..');
        if (newpth==pth) break;
        else pth=newpth;
    }

    return '';
}

export default {findPitakaFolder}