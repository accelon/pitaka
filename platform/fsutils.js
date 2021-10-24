import {PITAKA_EXT} from './constants.js'
export const findPitakaFolder=name=>{
    if (typeof global=='undefined') return "";
    if (! 'fs' in global) return;
    let pth=process.cwd();
    
    while (pth) {
        const fn=pth+global.Path.sep+name+PITAKA_EXT;        
        const js000=pth+global.Path.sep+name+Path.sep+'000.js'
        const fnjs000=pth+global.Path.sep+name+Path.sep+name+Path.sep+'000.js';
        if (fs.existsSync(fn)) {
            return pth+'/';
        } else if (fs.existsSync(fnjs000)) {
            return pth+'/'+name+'/';
        } else if (fs.existsSync(js000)){
            return pth+'/';
        }
        const newpth=Path.resolve(pth,'..');
        if (newpth==pth) break;
        else pth=newpth;
    }

    return '';
}
export default {findPitakaFolder}