import Label from './label.js'
import {pack,pack2,unpack,pack_delta2d,unpack_delta2d,unpack2,pack_delta,unpack_delta,packStrings,unpackStrings,bsearch} from'../utils/index.js';
import {YEARPLUS} from './constant.js'
class LabelYear extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.years=[];
        this.lineposs=[];
        this.context=opts.context;
        this.master=opts.master;
        this.caption=opts.caption;
        this.type=opts.type||'ad';
        this._years={};
        return this;
    }
    action( tag ,linetext){
        let year=parseInt(tag.attrs.n);
        if (!year) {
            console.log(tag,linetext)
        }
        if (year<0 ) {
            throw "negative year, set type to bc "+linetext;
        }
        if (year>2200) {
            throw "wrong year "+year+ ' '+linetext;
        }

        if (this.type=='bc') year=-year;
        this.count++;
        year+=YEARPLUS;
        if (!this.years[year])this.years[year]=[];
        this.years[year].push(tag.y);
    }
    reset() {
    }
    serialize(){
        const out=super.serialize();

        const yearlines=[]
        for (let year in this.years) {
            yearlines.push([year, this.years[year] ] );
        }
        yearlines.sort((a,b)=>a[0]-b[0]);
        out.push(JSON.stringify({caption:this.caption,length:yearlines.length}));
        out.push(pack2( yearlines.map(it=>it[0])));

        this.lineposs=yearlines.map(it=>it[1]);
        out.push(pack_delta2d( this.lineposs));
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        const header=JSON.parse(payload[at++]);payload[at-1]='';
        this.caption=header.caption;
        this.years=unpack2(payload[at++]);payload[at-1]='';

        this.lineposs=unpack_delta2d(payload[at++]);payload[at-1]='';

    }
    finalize() {


    }
}
export default LabelYear;