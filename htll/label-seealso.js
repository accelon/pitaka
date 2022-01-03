import { unpack3,unpack3_2d} from '../utils/unpackintarray.js';
import { pack3,pack3_2d } from '../utils/packintarray.js';
import {reversify2} from '../nlp/utils.js'
import {bsearch} from '../utils/bsearch.js'
import Label from './label.js'
//參見, to be resolved after entries is build
class LabelSeeAlso extends Label {
    constructor(name,opts={}) {
        super(name,opts);
        this.entries=[]; //^se
        this.targets=[];// [^e,^e,^e] 
        this.seealso=[]; // ^e , [^se,^se]
        //build time only
        this._linkedBy={}; //entry
        this._linkedByn=[]; //convert to nth entry
        return this;
    }
    action(tag,linetext,ctx){
        const keyword=linetext.substr(tag.x,tag.w);
        if (!this._linkedBy[keyword]) this._linkedBy[keyword]=[];
        this._linkedBy[keyword].push(ctx.entry);
        this.count++;
    }
    serialize(){
        const out=super.serialize();
        out.push(pack3(this._linkedByn.map(it=>it[0])));
        out.push(pack3_2d(this._linkedByn.map(it=>it[1])));
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        this.entries=unpack3(payload[at++]);payload[at-1]='';
        this.targets=unpack3_2d(payload[at++]);payload[at-1]='';

        this.seealso =reversify2(this.entries,this.targets);
    }
    finalize(ctx){
        const entries=ctx.labeldefs['e'];
        for (let i in this._linkedBy ) {
            const at=bsearch(entries.idarr,i);
            if (at==-1) {
                throw "see also not found "+i;
            }
            const referer=[];
            for (let j=0;j<this._linkedBy[i].length;j++) {
                const child=this._linkedBy[i][j];
                const at2=bsearch(entries.idarr,child);
                referer.push(at2);
            }
            referer.sort((a,b)=>a-b);
            
            this._linkedByn.push([at,referer]);
        }
        this._linkedByn.sort((a,b)=>a-b);
        // const scores=textRank(this.linkedBy,forward);
        // fs.writeFileSync('scores2.txt',scores.join('\n'),'utf8')
        // console.log(scores)
    }
}
export default LabelSeeAlso;