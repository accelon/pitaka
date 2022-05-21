import year from "./year.js";
import zh_partial from "./zh_partial.js";
import range_multiple from "./range_multiple.js";

const Criteria={zh_partial,range_multiple,year};

export const getCriterion=name=>{
	return Criteria[name];
}

