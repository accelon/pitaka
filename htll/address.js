const nlineOf=(ns,nslabels,id)=>{
    for (let i in nslabels) {
        const r=nslabels[i].nlineOf(id);
        if (r) {
            const [nline,eline] = r;
            return {ns,id,nline,eline}
        }
    }
    return null;
}
export const parseAddress=(namespaces,nsnline,addr)=>{
    let [ns,id]=addr.split('#');
    let nsobj=namespaces[ns];

    if (nsobj) {
        return nlineOf(ns,nsobj,id);
    } else {
        //is a namespace
        const eline=10;//todo get the first section of book
        if (nsnline[ns]) return {ns,id:'',nline:nsnline,eline}
        
        for (let ns in namespaces) {
            const r=nlineOf(ns,namespaces[ns],id);
            if (r)return r;
        }
    }
}

