import Label from './label.js'
import {pack,pack2,unpack,unpack2,pack_delta,unpack_delta,pack_delta2d,unpack_delta2d,bsearch} from'../utils/index.js';
import {YEARPLUS} from './constant.js'
class LabelYearSpan extends Label {
    constructor(name,opts={}) {
        super(name,opts)
        this.years=[];
        this.yearsEnd=[];
        this.lineposs=[];
        this.context=opts.context;
        this.master=opts.master;
        this.caption=opts.caption;

        this._years={};
        return this;
    }
    action( tag ,linetext){
        const[y1,y2]=linetext.substr(tag.x,tag.w).split('~');

        let year=parseInt(y1)||0;
        let yearend=parseInt(y2)||0;

        if (year===0&&yearend!==0) year=yearend-100;
        if (year!==0&&yearend===0) yearend=year+100;

        if (year>2200|| yearend>2200) {
            throw "wrong year "+linetext;
        }
        year+=YEARPLUS;
        yearend+=YEARPLUS;

        if (year<0 || yearend<0) {
            throw "out of year span start:"+y1+' end'+y2;
        }
        this.count++;
        if (!this.years[year])this.years[year]=[yearend,[]];
        this.years[year][1].push(tag.y);
    }
    reset() {
    }
    serialize(){
        const out=super.serialize();
        const yearlines=[]
        for (let year in this.years) {
            yearlines.push([parseInt(year), this.years[year][0], this.years[year][1] ] );
        }
        yearlines.sort((a,b)=>a[0]-b[0]);
        out.push(JSON.stringify({caption:this.caption,length:yearlines.length}));
        
        out.push(pack2( yearlines.map(it=>it[0]))); //year start
        out.push(pack2( yearlines.map(it=>it[1]))); //year end
        this.lineposs=yearlines.map(it=>it[2]);
        out.push(pack_delta2d( this.lineposs));
        return out;
    }
    deserialize(payload){
        let at=super.deserialize(payload);
        const header=JSON.parse(payload[at++]);payload[at-1]='';
        this.caption=header.caption;
        this.years=unpack2(payload[at++]);
        this.yearsEnd=unpack2(payload[at++]);
        this.lineposs=unpack_delta2d(payload[at++]);payload[at-1]='';
    }
    finalize() {

    }
}
export default LabelYearSpan;