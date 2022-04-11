import TIASTList from './iastlist.js';
import TList from './list.js';
import {combineList} from './combine.js'

const vri=new TIASTList('Namo tassa bhagavato arahato sammāsambuddhassa nikāyo',{akey:'vri'});

const kmjtable=[['Namo','nam	名	as	中	単	主	南無、礼拝'],
['tassa','	代	代的	男	単	与	それ、かれ'],
['bhagavato','	名	ant	男	単	与	世尊'],
['arahato','arh	名現分	ant	男	単	与	羅漢'],
['sammā','	不変	‐	‐	‐	‐	正しい、正しく'],
['sambuddhassa',	'saṃ-budh	名過分	a	男	単	与	等覚者'],
['nikāyo','名	a	男	単	主	部、部類']
]

const kmj=new TList(kmjtable,{akey:'kmj'});

const combined=combineList(vri,kmj)
console.log(combined)