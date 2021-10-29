import {LabelType} from '../htll/index.js'

const serializeLabels=(ctx)=>{
    let pos=3;//labelNames,labelTypes,labelPoss
    const labelNames=[],labelPoss=[],labelTypes=[];
    let section=[],finalizing=[];

    for (let name in ctx.labeldefs) {
        const lt=ctx.labeldefs[name];
        finalizing.unshift(lt);
    }
    
    finalizing.forEach(lt=>lt.finalize(ctx));

    for (let name in ctx.labeldefs) { 
        const lt=ctx.labeldefs[name];
        labelNames.push(name);
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

const deserializeLabels=(section,range,typedefs)=>{
    const labelNames=section[0].split(',');
    const labelTypes=section[1].split(',');
    const labelPoss=JSON.parse('['+section[2]+']');
    const out=[];
    const lastLine=range[1];
    for (let i=0;i<labelNames.length;i++) {
        const name=labelNames[i];
        const lt=new LabelType[labelTypes[i]](name, { lastLine, ...typedefs[name][1] });
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