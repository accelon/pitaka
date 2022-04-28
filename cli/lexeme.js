import {getSrcFiles  } from '../basket/config.js';
import {readTextLines} from "../platform/fsutils.js";
import { parseOfftextLine } from '../offtext/parser.js';
import {tokenize,TOKEN_SEARCHABLE} from '../search/index.js'
import { sortObj } from '../utils/sortedarray.js';
import { writeChanged } from './index.js';
export const lexemeOfSrcFiles = async config=>{
    const lexemes={};
    const files=getSrcFiles(config,true);
    // files.length=3;

    files.forEach(fn=>{
        process.stdout.write('\r'+fn+'       ');
        const lines=readTextLines(fn);
        for (let i=0;i<lines.length;i++) {
            const [text]=parseOfftextLine(lines[i]);
            const tokens=tokenize(text,{searchable:true}).map(it=>it[2]);
            tokens.forEach(tk=>{
                if (!isNaN(parseInt(tk)))return;
                tk=tk.replace(/\d$/,'');
                if (!lexemes[tk])lexemes[tk]=0;
                lexemes[tk]++;
            })
        }
    })
    process.stdout.write('\r                       ')
    const arr=sortObj(lexemes);
    const outfn='lexeme.txt';
    if (writeChanged(outfn,arr.join('\n'))){
        console.log('written ',outfn,'entries',arr.length)
    }
}