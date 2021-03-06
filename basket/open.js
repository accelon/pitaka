import JSONPROM from "../jsonprom/jsonprom.js";
import pool from './pool.js';
import {deserializeLabels, deserializeLineposString, deserializeNotes,deserializeLemma} from './serializer.js';
import {NAMESEP,DEFAULT_LANGUAGE} from '../platform/constants.js';
import pagingAPI from './paging.js';
import entriesAPI from './entries.js';
import headingsAPI from './headings.js';
import pointersAPI from './pointers.js';
import mulusAPI from './mulus.js';
import invertedAPI from './inverted.js';
import criteriaAPI from './criteria.js';
import connectionsAPI from './connections.js';
import notesAPI from './notes.js';
import {labelByTypeName} from "../htll/index.js"
import {combineObject} from '../utils/index.js'
import Templates from "../format/templates.js"
class Basket extends JSONPROM {
    constructor(opts) {
        super(opts)
        this.sections=[]
        this.labelTypes=[];
        this.labels={};
        this.foreign={};        //search backlinks here
        this.futureforeign={};  //not in pool yet, to be check on every new ptk added to pool.
        this.aligned=[];        //name of aligned ptk, in pool
        this.lblTransclusion=null;
        this.inverted=null;
        this.loadtime={};
        this.criteria={};   
        this.cache={}; //generic cache
        for (let f in pagingAPI) this[f]=pagingAPI[f];
        for (let f in entriesAPI) this[f]=entriesAPI[f];
        for (let f in headingsAPI) this[f]=headingsAPI[f];
        for (let f in pointersAPI) this[f]=pointersAPI[f];
        for (let f in mulusAPI) this[f]=mulusAPI[f];
        for (let f in invertedAPI) this[f]=invertedAPI[f];
        for (let f in criteriaAPI) this[f]=criteriaAPI[f];
        for (let f in connectionsAPI) this[f]=connectionsAPI[f];
        for (let f in notesAPI) this[f]=notesAPI[f];
        this.querystore=null; //query result store 
        this.headings=[];
        this.headingsLinepos=[];
        this.notes=null;
    }
    init(){
        const labels='labels'
        const self=this;
        let now=new Date();
        const promise=new Promise(resolve=>{
            self.load(0).then(function(){
                const at=self.header.title.indexOf(NAMESEP);
                if (at>0) {
                    self.header.shorttitle=self.header.title.substr(at+1);
                    self.header.title=self.header.title.substr(0,at);
                } else {
                    self.header.shorttitle=self.header.title.substr(0,2);
                }
                self.header.lang=self.header.lang||DEFAULT_LANGUAGE;
                //basket could be alignment, might not in pool
                if (self.header.alignment && typeof self.header.alignment=='string') {
                    self.header.alignment=self.header.alignment.split(',');
                } else self.header.alignment=[];
                self.loadtime.open=new Date()-now; now= new Date();
                self.loadSection(labels,function(){
                    const labelSection=self.getSection(labels);
                    const labelSectionRange=self.getSectionRange(labels);
                    const typedefs=combineObject((Templates[self.header.template]||{}).labels||{}, self.header.labels||{} );
                    self.labels=deserializeLabels(labelSection,labelSectionRange,typedefs);
                    self.lblTransclusion=self.getLabel('t');
                    self.loadtime.labels=new Date()-now; now= new Date();
                    
                    self.cache.labelLang=self.findLabelType('LabelLang');
                    if (!self.header.chunk) {
                        if (self.getLabel('bk')) self.header.chunk='bk';
                        else if (self.getLabel('e')) self.header.chunk='e';
                        else throw "no chunk label (bk or e)"
                    }
                    //compatible code
                    if (!self.header.locator && self.header.tree) {
                        self.header.locator=self.header.tree;
                    }
                    if (!self.header.heading) {
                        self.header.heading=self.header.chunk;
                    }
                    
                    self.criteria=self.registerCriteria();
                    const notes='notes';
                    
                    if (self.header.sectionNames.includes(notes)){
                        const [from]=self.getSectionRange(notes);
                        self.prefetchLines(from,2).then(()=>{
                            self.notes=deserializeNotes.call(self,from);
                        });
                    }
                    
                    if (self.header.lemma) {
                        const [from]=self.getSectionRange('lemma');
                        self.prefetchLines(from,1).then(()=>{//lemma is
                            self.lemma=deserializeLemma.call(self,from)
                        })
                    }

                    const headings='headings';
                    if (self.header.sectionNames.includes(headings)){                            
                        self.loadSection(headings,function(){
                            const headingsSection=self.getSection(headings);
                            const range=self.getSectionRange(headings);
                            const [linepos,strings]=deserializeLineposString(headingsSection,range);
                            self.headingsLinepos=linepos;
                            self.headings=strings;
                            if (self.header.searchable) setupInverted().then( resolve(true))
                            else resolve(true);
                        });
                    } else if (self.header.searchable) setupInverted().then( resolve(true))
                    else resolve(true);

                    //resolve earlier, need to check if inverted ready
                });
            });
        });
        return promise;
    }
    ltp(){
        return this.inverted?this.inverted.linetokenpos:null;
    }
    contentCount() {
        let lbl=this.getLabel('bk');
        if (!lbl) {
            lbl=this.getLabel('e');
        };
        if (!lbl)return 0;
        return lbl.linepos.length;
    }
    chunkCount() {
        let lbl=this.getLabel(this.header.chunk);
        if (!lbl)return 0;
        return lbl.linepos.length;
    }
    isDictionary(){
        return this.header.locator=='e'
    }
    parse(str){
        for (let i=0;i<this.labels.length;i++) {
            const r=this.labels[i].parse(str);
            if (r) {
                //begin of labels section is end of text
                if (r.eline==-1) r.eline=this.header.sectionStarts[1];
                return r;
            }
        }
    }
    findLabelType(labeltype) {
        if (typeof labeltype!=='string') {
            labeltype=labeltype.constructor.name;
        }
        return labelByTypeName(labeltype,this.labels);
    }
    getLabel(name){
        for (let i=0;i<this.labels.length;i++) {
            if (this.labels[i].name==name) return this.labels[i];
        }
    }
    getBookLabel() {
        return this.findLabelType('LabelBook');
    }
    getChunkLabel() {
        return this.getLabel(this.header.chunk.split('/')[0]||'ck')
    }
    getHeadingLabel() {
        return this.getLabel(this.header.heading.split('/')[0]||'ck')
    }
    find(label,tofind,near) {
        const lbl=this.getLabel(label);
        if (!lbl)return null;
        return lbl.find(tofind,near);
    }
    lastTextLine(){
        return (this.header.sectionStarts[1]||this.header.lineCount)-1;
    }
}

export async function openBasket(name){
    if (pool.has(name)) {
        // console.log('reuse',name)
        return pool.get(name);
    }
    const ptk= new Basket({name});
    try {
        const success=await ptk.init();
        if (success) { //a new pitaka is added to pool
            pool.add(name,ptk);
            ptk.connect();
            pool.getAll().forEach( p=>p.connect()); //tell other pitaka 
        }
    } catch(e) {
        console.error(e)
    }
    return ptk;
}

export const openPointerBaskets=async arr=>{
    if (!Array.isArray(arr)) arr=[arr];
    const pitakas={};
    for (let i=0;i<arr.length;i++) {
        let ptr=arr[i];
        if (ptr[0]==PATHSEP) {
            const pths=ptr.split(PATHSEP);
            pths.shift(); //drop leading PATHSEP
            pitakas[pths.shift()]=true;
        }
    }
    const jobs=[];
    for (let name in pitakas) {
        if (!pool.has(name)) jobs.push(openBasket(name));
    }
    await Promise.all(jobs);
}