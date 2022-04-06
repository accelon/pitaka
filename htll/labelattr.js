

export function doAttributes(self,tag,linetext){
    for (let attr in tag.attrs) {
        const val=tag.attrs[attr];
        
        if (self.attrdef[attr]) {
            const valueCounter='__counter.'+tag.name+'@'+attr;
            if (!self[valueCounter]) {
                self[valueCounter]={};
                const options=self.attrdef[attr].options;
                for (let i=0;i<options.length;i++) {
                    self[valueCounter][options[i][0]]=0;
                }
            };
            const validval=typeof self[valueCounter][val] !== 'undefined';
            if (!validval) console.warning("invalid attribute value, attr key=",val,'line',linetext);
            else {
                self[valueCounter][val]++;
            }
        }
    }
}