import {diffChars} from 'diff';
export const diffCJK=(oldStr, newStr)=>{
    return diffChars(oldStr, newStr);
}
export default {diffCJK};