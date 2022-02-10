export * from "./build.js"
export * from "../platform/constants.js"
import {glob,filesFromPattern} from '../utils/pattern.js'
import {patchBuf} from '../utils/errata.js'
import nodefs from '../platform/nodefs.js' // "await nodefs" at begining of cli script
import kluer from "./kluer.js"
import { openBasket } from "../basket/index.js"

const writeChanged=(fn,buf,enc='utf8')=>{ //write to fn only if changed
    const oldbuf=fs.existsSync(fn) && fs.readFileSync(fn,enc);
    if (oldbuf!==buf) {
        fs.writeFileSync(fn,buf,enc);
        return true;
    }
    return false;
}
const readTextContent=fn=>{
    let s=fs.readFileSync(fn,'utf8');
    if (s.charCodeAt(0)===0xfeff) s=s.substr(1);
    return s;
}
const readTextLines=fn=>readTextContent(fn).split(/\r?\n/);

export {kluer,glob,patchBuf,nodefs,writeChanged,filesFromPattern,openBasket,
    readTextContent,readTextLines};