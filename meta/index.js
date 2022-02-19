import {bookParanumToCluster,firstParanumOf} from "./cs-paranum.js";
import { booksOf, pitakaOf,getFilesOfBook,sortFilenames} from "./sc-code.js";
export const cs ={
    firstParanumOf,bookParanumToCluster
}
export const sc={
    getFilesOfBook,pitakaOf,booksOf,sortFilenames
}
export default {cs,sc};