import {readTextFile,readBLOBFile} from 'pitaka/platform'
import {readHaodoo} from './haodoo.js';
const readPlainTextFile=async fn=>{
    return await readTextFile(fn);
}
//download link http://www.haodoo.net/?M=d&P=C[bookid].updb

const readHaodooFile=async fn=>{
    const buf=await readBLOBFile(fn);
    return readHaodoo(buf).join(String.fromCharCode(0x0a,0x1a));//0x1a terminate marker
}
export {readPlainTextFile,readHaodooFile,readHaodoo};