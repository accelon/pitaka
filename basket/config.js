import reservedname from "./reservedname.js";
import { filesFromStringPattern } from "../utils/index.js";
export function validateConfig(json,filenames){
    if (!json) return 'empty json'
    if (!json.name) return 'missing "name" field';
    if (!json.name.match(/^[a-z][_a-z\d]*?$/)) return 'invalid "name", should match ([a-z][_a-z0-9]*) '
    if (json.name.length<4 && !reservedname[json.name]) return '"name" too short, need 4 characters or more.'
    if (json.name.length>31) return '"name" should not be more than 32 characters.'

    if (typeof json.files=='string') json.files=fileFromStringPattern(json.files);
    for (let i=0;i<json.files.length;i++) {
        const f=json.files[i];
        const at=filenames.indexOf(f);
        if (at==-1) {
            return f+" not selected";
        }
    }
    return null; //ok
}