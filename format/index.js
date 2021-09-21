import {readTextFile} from 'pitaka/platform'

const readContent=async fn=>{
    return await readTextFile(fn);
}
export {readContent};