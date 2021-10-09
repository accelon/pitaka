export const getLinksAtLine=(nline)=>{
    const links=[];
    const hrefs=this.labels[0].hrefs;
    if (!hrefs)return links;
    const {nsnline}=this.labels[0].header;
    let localns='';
    for (let i in nsnline) {
        if (nline>nsnline[i]) {
            localns=i;
        }
    }
    const {nlines,offsets,targets,lengths}=hrefs;
    const at=bsearch(hrefs.nlines,nline);
    let end=at+1;
    if (at>-1) {
        links.push( [offsets[at] , lengths[at], targets[at], localns ]);
        while (end<hrefs.nlines.length&&nlines[end]==nline) {
            links.push( [offsets[end] , lengths[end] ,targets[end] ,localns])
            end++
        }
    }
    return links;
}