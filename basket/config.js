import reservedname from "./reservedname.js";
import { filesFromPattern } from "../utils/index.js";
import {fileContent,getFormatTypeDef,Templates} from '../format/index.js'
import { LOCATORSEP } from "../platform/constants.js";

export function validateConfig(json,filenames){
    if (!json) return 'empty json'
    if (!json.name) return 'missing "name" field';
    if (!json.name.match(/^[a-z][_a-z\d]*?$/)) return 'invalid "name", should match ([a-z][_a-z0-9]*) '
    if (json.name.length<4 && !reservedname[json.name]) return '"name" too short, need 4 characters or more.'
    if (json.name.length>31) return '"name" should not be more than 32 characters.'

    if (typeof json.files=='string') json.files=filesFromPattern(json.files);
    for (let i=0;i<json.files.length;i++) {
        const f=json.files[i];
        const at=filenames.indexOf(f);
        if (at==-1) {
            return f+" not selected";
        }
    }
    return null; //ok
}
const combineJSON=(pat,key,obj)=>{
    const files=filesFromPattern(pat);
    obj[key]={};
    files.forEach(fn=>{
        fileContent(fn).then(content=>{
            const json=JSON.parse(content);
            if (Array.isArray(json)) {
                obj[key]=json;
            } else {//combine multiple object
                for (let k in json) obj[key][k]=json[k];
            }
        });    
    });
}
const addJSON=(pat,key,context)=> {
    if (typeof pat==='string') {
        combineJSON(pat,key,context);
    } else { //multiple json
        context[key]={};
        for (let subkey in pat) {
            combineJSON(pat[subkey]  , subkey, context[key]);
        }
    }
}
const  addErrata=(pat,context)=> {
    const files=filesFromPattern(pat);
    files.forEach(erratafile=>{
        fileContent(erratafile).then(content=>{
            const errata=JSON.parse(content);
            for (let fn in errata) {
                for (let i in errata[fn]) {
                    const [from,to,opts]=errata[fn][i];
                    if (opts===true) {
                        const regex=new RegExp(from,'g');
                        errata[fn][i]=[regex,to];
                    }
                }
            }
            context.errata=errata;
        })
    });
}
export const initConfigTemplate=config=>{
    const template=Templates[config.template||'simple'];
    if (config.template && !template) {
        throw "template "+config.template+" not found";
    }
    for (let key in template) {
        if (key=='labels') continue;
        if (typeof config[key]=='undefined') {
            config[key]=template[key];
        }
    }
}
export const getSrcFiles=(config,withfolder=false)=>{
    initConfigTemplate(config);
    const files=filesFromPattern(config.files,config.rootdir);
    return withfolder?files.map(f=>config.rootdir+f):files;
}


export const initPitakaJSON=(config,context,log)=>{
    initConfigTemplate(config);
    context.labeldefs=getFormatTypeDef(config,{context:context,log});
	
    if (!config.chunk) {
        if (context.labeldefs.bk) config.chunk='bk';
        else if (context.labeldefs.e) config.chunk='e';
        else throw "no chunk label (bk or e)"
    } else {
        const chunkTags=config.chunk.split(LOCATORSEP);
        chunkTags.forEach(chunk=>{
            if (!context.labeldefs[chunk]) {
                throw "chunk label "+chunk+" not defined";
            }
        })
    }

    if (!config.heading) config.heading=config.chunk;
    if (!config.heading) throw "missing heading"

    if (!config.locator) config.locator=config.chunk;
    if (!config.locator) throw "missing locator"

    if (typeof config.locator==='string') config.locator=config.locator.split(LOCATORSEP);
    
    if (config.eudc) addJSON(config.eudc,'EUDC',context);
    if (config.milestones) addJSON(config.milestones,'milestones',context);
    if (config.errata) addErrata(config.errata,context);
    if (config.catalog) addJSON(config.catalog,'catalog',context);
    if (config.transclusion) addJSON(config.transclusion,'transclusion',context);


    if (config.lemma) {
        fileContent(config.lemma).then(content=>{
            context.lemma=content.split(/\r?\n/);
        })
    }
    // if (config.breakpos) addJSON(config.breakpos,'breakpos',context);
}

export const initLabelTypedef=(config,context,log)=>{
    const defs=context.labeldefs;
    for (let lbl in defs) {
        const labeltype=defs[lbl];
        if (typeof labeltype.resets==='string') {
            labeltype.resets=labeltype.resets.split(",");
        }
    }
    for (let lbl in defs) {
        const labeltype=defs[lbl];
        if (labeltype.resets) {
            console.error(`attribute "resets" in parent label is obsolute, use "reset" in child label`);
        }
        labeltype.resets=[];
    }
    for (let lbl in defs) {
        const labeltype=defs[lbl];
        if (labeltype.reset) {
            const resetlbl=defs[labeltype.reset];
            if (!resetlbl) {
                throw "resetter label "+labeltype.reset+" not found";
            }
            if (!resetlbl.resets.includes(labeltype.name)) resetlbl.resets.push(labeltype.name);
        }
    }
}