import double_number from "./double_number.js";
import substring from "./substring.js";
import range_multiple from "./range_multiple.js";

const Criteria={substring,range_multiple,double_number};

export const getCriterion=name=>{
	return Criteria[name];
}

