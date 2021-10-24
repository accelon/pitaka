class nGram {
    constructor (opts) {
        this.gram=opts.gram;
        this.stockgram=opts.stockgram;
        this.ngram={};
        this.minoccur=opts.minoccur||100;
    }
    add(content){
        for (let j=0;j<content.length;j++) {
            let prev=0;
            const line=content[j]            
            for (let i=0;i<line.length;i++) {
                const cp=line.charCodeAt(i);
                if (cp>=0x4e00 && cp<=0x9FFF) { //BMP CJK ONLY
                    if (prev) {
                        let pass=true;
                        if (this.stockgram) {
                            pass=!!this.stockgram[prev];
                        } 
                        if (pass) {
                            const g=prev+line.charAt(i);
                            if (!this.ngram[g]) this.ngram[g]=0;
                            this.ngram[g]++;        
                        }
                    }
                    prev+=line[i];
                    if (prev.length>this.gram) {
                        prev=prev.substr(1);
                    }
                } else {
                    prev='';
                }
            }
        }

    }
    dump() {
        let out=[];
        for (let g in this.ngram) {
            out.push([g,this.ngram[g]]);
        }
        out=out.filter(a=>a[1]>this.minoccur)
        out.sort((a,b)=>b[1]-a[1]);
        return out;
    }

}

export default nGram;