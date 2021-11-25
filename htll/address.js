export const nlineOf=(ns,nslabels,id)=>{
    for (let i in nslabels) {
        const r=nslabels[i].nlineOf(id);
        if (r) {
            const [nline,eline] = r;
            return {ns,id,nline,eline}
        }
    }
    return null;
}
const nLineOfFirstKey=nsobj=>{
    const nol=nsobj['.'].nol;
    return nol.val(nol.key(1));
}

export const parseAnchor=(namespaces,titles,header,addr)=>{
    let [ns,id]=addr.split('#');
    let nsobj=namespaces[ns];
    const {title,nsnline}=header;
    if (!nsobj) {
        ns=titles[ns];
        nsobj=namespaces[ns]
    }
    if (nsobj) {
        if (id) {
            return nlineOf(ns,nsobj,id);
        } else {
            let intropage=null;
            if (nsnline[ns]) {
                for (let name in title) {
                    if (title[name]==ns) {
                        const eline=nLineOfFirstKey(nsobj);
                        intropage={ns,id:'',title:name,nline:nsnline[ns],eline};
                        break;
                    }
                }
            }
            return intropage;
        }
    } else {
        const eline=10;//todo get the first section of book
        if (nsnline[ns]) return {ns,id:'',nline:nsnline[ns],eline}

        for (let ns in namespaces) {
            const r=nlineOf(ns,namespaces[ns],id);
            if (r)return r;
        }
    }
}

