import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
/* jszip is huge, add to index.html to avoid re-bundle */
export default [
    {
      input: ["./utils/lazip.js"],
      output: {
        sourcemap: false,
        format: "umd",
        name: "lazip",
        file: "lazip.js",
      },
      plugins: [
        resolve({ browser: true}),
        commonjs(),
        // terser(),
      ],
   }

]