import {bookParanumToChunk,firstParanumOf} from "./cs-paranum.js";
import { FirstPN } from "./cs-first.js";
import { booksOf, pitakaOf,getFilesOfBook,sortFilenames} from "./sc-code.js";
export const cs ={
    firstParanumOf,bookParanumToChunk,FirstPN,
}
export const sc={
    getFilesOfBook,pitakaOf,booksOf,sortFilenames
}
export default {cs,sc};