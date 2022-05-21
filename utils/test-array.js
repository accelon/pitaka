import {union,intersect} from './array.js'
console.log('union',union([1,2,2,3],[4,4,5],true));
console.log('intersect',intersect([1,1,1,2,2,2,3,4,5,6],[2,3,3,4]));