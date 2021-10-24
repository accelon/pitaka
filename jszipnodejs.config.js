/* 3rdparty/jszip.js is touch manually,
  need to generate es6 module for node js
*/

import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
/* jszip is huge, add to index.html to avoid re-bundle */
export default [
    {
      input: ["./3rdparty/jszip.js"],
      output: {
        sourcemap: false,
        format: "es",
        name: "jszip",
        file: "3rdparty/jszip.node.js",
      },
      plugins: [
        resolve({browser:true}),
        commonjs(),
        // terser(),
      ],
   }

]