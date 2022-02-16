import {loadJSONP,loadFetch,loadNodeJs,loadNodeJsZip} from './loadchunk.js';
import {findPitakaFolder} from '../platform/fsutils.js'
import {readLines,prefetchLines,  unreadyChunk,prefetchChunks} from './readline.js';
import {ROMEXT} from '../rom/romconst.js';
import {bsearch} from '../utils/bsearch.js'

class JSONPROM {
    constructor(opts) {
        this.context = {
            accLength:0,
            loadedChunk:[]
        };
        this.romzip=null;
        this.romfolder=findPitakaFolder(opts.name);
        this.filenames=[];
        this.offsets=[];
        this.rom=null;
        this.name=opts.name||'noname';
        this.header= {
            name:this.name,
            title:'',shorttitle:'',
            lastTextLine:0,
            chunkStarts:[1],
            sectionNames:['txt'],
            sectionStarts:[1],
            format:'',
        }
        this.opts=opts||{};
        const lines=[''];
        this._lines=lines;
        this._loader=this.romzip?loadNodeJsZip:loadNodeJs;
        if (typeof window!=='undefined') {
            const protocol=window.location.protocol;
            if (protocol==='http:'||protocol==='https:'|| protocol==='chrome-extension:') {
                this._loader=loadFetch;
            } else {
                this._loader=loadJSONP;
                this.context.jsonp=true;
            }
        };
        this.readLines=readLines;
        this.prefetchLines=prefetchLines;
        this.prefetchChunks=prefetchChunks;
        this.unreadyChunk=unreadyChunk;
        this.getLine=i=>lines[i];
        this.deleteLine=i=>lines[i]='';
        return this;
    }
    setChunk(chunk,header,payload){
        if (chunk==0) {
            this.header=header;
            this.payload=payload;
            this.format=header.format;
            this.opts.onReady&&this.opts.onReady(this);
        } else {
            const hlp=this.headingsLinepos;
            let hidx=bsearch(hlp,header.start-1,true);
            for (let i=0;i<payload.length;i++) {
                const y=header.start+i;
                let line=payload[i];
                if (y==hlp[hidx]+1 && hidx<hlp.length) {
                    line=this.headings[hidx]+line; //headings is separated from body in parseOfftextHeadings
                    hidx++;
                }
                this._lines[y]=line;
            }
        }
        this.context.loadedChunk[chunk]=true;
    }
    async load(_chunk=0){
        let res;
        if (!this.context.loadedChunk[_chunk]) {
            // this.context.loadedChunk[_chunk]=true; //assuming loading is ok, prevent multiple load
            res = await this._loader(this.header.name,_chunk,this);
            if (res) this.setChunk(_chunk,res.header,res.payload);
            else {
                this.context.loadedChunk[_chunk]=false;
            }
        }        
    }
    getSectionRange(name){
        const {sectionNames,sectionStarts,lineCount}=this.header;
        
        const i=sectionNames.indexOf(name);
        if (i<0) return [0,0];
        const from=sectionStarts[i];
        const to= (i<sectionNames.length-1)?sectionStarts[i+1]:lineCount;
        return [from,to];
    }
    getSection(name) {
        const out=[];
        const [from,to]=this.getSectionRange(name);
        for (let i=from;i<to;i++) out.push(this.getLine(i));
        return out;
    }
    loadSection(name,cb){
        const [from,to]=this.getSectionRange(name)
        this.prefetchLines(from,to).then(cb);
    }
}
export default JSONPROM;