import { openBasket } from '../index.js';

export const prepareInput=async (labelfield)=>{ 
    const fn=process.argv[3];
    const ptkname=process.argv[4];
    let names=[],idarr=[];
    if (fs.existsSync(ptkname) && !fs.statSync(ptkname).isDirectory()) {
        const lines=fs.readFileSync(ptkname,'utf8').split(/\r?\n/);
        for (let i=0;i<lines.length;i++) {
            const [bkname,bkid]=lines[i].split(/[,\t]/);
            names.push(bkname)
            idarr.push(bkid)
        }
    } else {
        const ptk=await openBasket(ptkname);
        if (!ptk) throw "cannot open pitaka "+ptkname;
        let lbl=ptk.getLabel('bk');
        if (!lbl) {
            lbl=ptk.getLabel('e');
            if (lbl) {
                names=lbl.idarr;
                if (labelfield) idarr=lbl[labelfield];
            }
        } else {
            names=lbl.names;
            idarr=lbl[labelfield||'idarr'];
        }
        if (!lbl) throw "not a valid pitaka"    
        
    }
    
    const lines=fs.readFileSync(fn,'utf8').trimLeft().split(/\r?\n/);
    return [lines,names,idarr];
}

