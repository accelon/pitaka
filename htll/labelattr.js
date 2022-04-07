

export function doAttributes(self,tag,linetext){
    if (!self.attrIndex) self.attrIndex={};
    const A=self.attrIndex;
    for (let attr in tag.attrs) {
        const val=tag.attrs[attr];
        if (self.attrdef[attr]) {
            if (!A[attr]) {
                A[attr]={};
                const options=self.attrdef[attr].options;
                for (let i=0;i<options.length;i++) {
                    A[attr][options[i][0]]=[];
                }
            };
            const validval=typeof A[attr][val] !== 'undefined';
            if (!validval) console.warn("invalid attribute value, attr key=",val,'line',linetext);
            else {
                A[attr][val].push(self.count);
            }
        }
    }
}