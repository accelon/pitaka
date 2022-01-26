import {loadJSONP,loadFetch,loadNodeJs,loadNodeJsZip} from './loadchunk.js';
import {findPitakaFolder} from '../platform/fsutils.js'
import {readLines,prefetchLines,  unreadyChunk,prefetchChunks} from './readline.js';
import {ROMEXT} from '../rom/romconst.js';


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
            for (let i=0;i<payload.length;i++) {
                this._lines[header.start+i]=payload[i];
            }
        }
        this.context.loadedChunk[chunk]=true;
    }
    async openrom(){
        return;
        if (this._loader==loadNodeJs || this._loader==loadNodeJsZip) {
            const romfn=this.romfolder;//test if romfolder is a .ptk
            if (fs.existsSync(romfn) && !fs.statSync(romfn).isDirectory()) {
                const zip=await lazip(romfn);
                this.romzip=zip;
                this._loader=loadNodeJsZip;
            }
            return;
        }
        const tries=[
            this.header.name+ROMEXT,
            this.header.name+'/'+this.header.name+ROMEXT
        ]

        //check if development mode 
        if (typeof location!=='undefined' && location.port==="5001") {
            const t=tries[0]; 
            tries[0]=tries[1];
            tries[1]=t;
        }
        let zip,romfn;
        for (let i=0;i<tries.length;i++) {
            romfn=tries[i];
            zip=await lazip(romfn);
            if(zip && Object.keys(zip.jszip.fileEntries).length) break;
        }

        if (zip &&Object.keys(zip.jszip.fileEntries).length) {
            this.romzip=zip;
            const folder=this.romzip.jszip.fileEntries[0].fileNameStr;
            this.filenames=this.romzip.jszip.fileEntries.map(i=>i.fileNameStr
                .substr(folder.length))//remove leading folder name
            .filter(i=>!!i);//remove pure folder
        }
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