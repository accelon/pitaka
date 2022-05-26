import kluer from './kluer.js'
import {openBasket} from '../basket/index.js';
const {blue,yellow,red,bgGreen} = kluer;
export const info=async config=>{
	const ptk=await openBasket(config.name);
	if (ptk) {
		console.log('headings',ptk.getHeadingLabel().names);
		console.log('labels',ptk.labels);
	} else {
		console.log('pitaka not build yet, config',config);
	}
}
