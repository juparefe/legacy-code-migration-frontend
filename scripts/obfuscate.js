const JavaScriptObfuscator = require("javascript-obfuscator");
const fs = require("fs");
const glob = require("glob");

const files = glob.sync("dist/**/*.js", { nodir: true });

for (const file of files) {
  const code = fs.readFileSync(file, "utf8");
  const obfuscated = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    stringArray: true,
    stringArrayEncoding: ["base64"],
    stringArrayThreshold: 0.75,
    renameGlobals: false
  }).getObfuscatedCode();

  fs.writeFileSync(file, obfuscated, "utf8");
}