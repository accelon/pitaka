import {parseKey} from '../utils/index.js'
import {NOLLinePos} from './nol-linepos.js' //數字型錨點
export const addAName=(tag,ns,context,aname,nline) =>{
    if (tag.offset!==0) throw "<a name> must be at the beginning, line:"+nline
    if (ns==aname) throw "<a name> conflicts with namespace(filename)"

    const key=parseKey(aname) ;
    if (key) {
        const r=ns['.'].push(key,nline);
        if (!r) throw "error key order "+aname+" at "+nline;
    } else {
        for (let i=0;i<context.anamepat.length;i++) {
            const [fname,pat]=context.anamepat[i];
            const m=aname.match(pat);
            if (m&& m[0]==aname) {
                const keystr=aname.replace(/[^\d\.]/g,'');
                const key=parseKey(keystr);
                if (key) {
                    if (!ns[fname]) ns[fname]=new NOLLinePos({namespace:context.namespace})
                    ns[fname].push(key,nline);
                } else {
                    throw "invalid a-name "+aname+ 'pattern '+fname;
                }
                return;
            }
        }//當作一般情況，按key排序，nline arr 亂序，無法delta 壓縮
        ns._.push(aname,nline); 
    }
}
export const addHref=(tag,href,hrefs,nline,text)=>{
    if (!href) return;
    let target=href.substr(1);
    if (!target) return;
    if (href[0]!='#') {
        const url=new URL(href,'http://localhost');
        target=decodeURI(url.hash.substr(1));
    }
    let innertext=text.substr(tag.rawoffset+tag.len).replace(/<\/a>.*/,'');
    hrefs.push([ nline, tag.offset,innertext.length, target ]);
}
