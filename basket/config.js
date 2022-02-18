import reservedname from "./reservedname.js";
import { filesFromPattern } from "../utils/index.js";
import {fileContent,getFormatTypeDef,Templates} from '../format/index.js'
import { LOCATORSEP } from "../index.js";
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
export const initPitakaJSON=(config,context,log)=>{
    const template=Templates[config.template];
    if (config.template && !template) {
        throw "template "+config.template+" not found";
    }
    for (let key in template) {
        if (key=='labels') continue;
        if (typeof config[key]=='undefined') {
            config[key]=template[key];
        }
    }
    context.labeldefs=getFormatTypeDef(config,{context:context,log});

    if (!config.cluster) {
        if (context.labeldefs.bk) config.cluster='bk';
        else if (context.labeldefs.e) config.cluster='e';
        else throw "no cluster label (bk or e)"
    } else {
        const clusterTags=config.cluster.split(LOCATORSEP);
        clusterTags.forEach(cluster=>{
            if (!context.labeldefs[cluster]) {
                throw "cluster label "+cluster+" not defined";
            }
        })
    }

    if (typeof config.locator==='string') config.locator=config.locator.split(LOCATORSEP);
    
    if (config.eudc) addJSON(config.eudc,'EUDC',context);
    if (config.milestones) addJSON(config.milestones,'milestones',context);
    if (config.errata) addErrata(config.errata,context);
    if (config.catalog) addJSON(config.catalog,'catalog',context);
    if (config.transclusion) addJSON(config.transclusion,'transclusion',context);
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
        // console.log(labeltype)
        if (labeltype.reset) {
            const resetlbl=defs[labeltype.reset];
            if (!resetlbl) {
                throw "resetter label "+labeltype.reset+" not found";
            }
            if (!resetlbl.resets.includes(labeltype.name)) resetlbl.resets.push(labeltype.name);
        }
    }
}