function getHeadingFilters(){
    const filters=[];
    const lbl=this.getHeadingLabel();
    if (lbl.hasname) filters.push({name:lbl.name,filter:"entry_"+ this.langOf()}); //chunk as entry
    for (let attr in lbl.attrdef) {
        filters.push(lbl.attrdef[attr]);
    }
    return filters;
}
export default {getHeadingFilters}