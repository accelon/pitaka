export const TOKENIZE_REGEX=/(([\u0021-\u1fff]+)|([\u2000-\u2fff\u3001-\uffff]+))/g
export const CJKWord_Reg=/([\u2e80-\u2fd5\u3400-\u9fff\ud400-\udfff\ue000\uffff]+)/g;
export const CJKWordEnd_Reg=/([\u2e80-\u2fd5\u3400-\u9fff\ud400-\udfff\ue000\ufadf]+$)/;
export const CJKWordBegin_Reg=/(^[\u2e80-\u2fd5\u3400-\u9fff\ud400-\udfff\ue000\uffff]+)/;
export const Romanize_Reg=/([A-Za-z\u00c0-\u02af\u1e00-\u1faf]+)/g;
// export const isCJKStopWord=ch=>{
//     return ch==='　' ||ch==='的'||ch==='之'
// }