import {LabelType} from '../htll/index.js'

const serializeLabels=(labeldefs)=>{
    let pos=3;//labelNames,labelTypes,labelPoss
    const labelNames=[],labelPoss=[],labelTypes=[];
    let section=[],finalizing=[];

    for (let name in labeldefs) {
        const lt=labeldefs[name];
        finalizing.unshift(lt);
    }
    finalizing.forEach(lt=>lt.finalize());

    for (let name in labeldefs) { 
        const lt=labeldefs[name];
        labelNames.push(lt.name);
        labelPoss.push(pos);
        labelTypes.push(lt.constructor.name);
        const lines=lt.serialize();
        section=section.concat(lines);
        pos+=lines.length;
    };
    section.unshift(labelPoss.join(','))
    section.unshift(labelTypes.join(','));
    section.unshift(labelNames.join(','));
    return section;
}

const deserializeLabels=(section,range)=>{
    const labelNames=section[0].split(',');
    const labelTypes=section[1].split(',');
    const labelPoss=JSON.parse('['+section[2]+']');
    const out=[];
    const lastLine=range[1];
    for (let i=0;i<labelNames.length;i++) {
        const lt=new LabelType[labelTypes[i]]( labelNames[i], {lastLine});
        const labelPayload=[];
        for (let j=labelPoss[i];j<(labelPoss[i+1]||section.length);j++ ) {
            labelPayload.push(section[j]);
        }
        lt.deserialize(labelPayload);
        out.push(lt);
    }
    return out;
}
export {serializeLabels,deserializeLabels}