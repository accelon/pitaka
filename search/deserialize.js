import {unpack_delta} from '../utils/index.js';

export const unpackPosting=(raw,tk)=>{
    return unpack_delta(raw);
}

export default {unpackPosting}