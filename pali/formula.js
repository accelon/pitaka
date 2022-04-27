import {readTextContent} from '../platform/fsutils.js'
export class Formula {
    constructor (fn) {
        const config=JSON.parse(readTextContent(fn));
        console.log(config)
    }

}
