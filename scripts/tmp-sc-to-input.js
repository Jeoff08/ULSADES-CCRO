import fs from 'fs'
const p = process.argv[2]
let s = fs.readFileSync(p, 'utf8')
const re =
  /onChange=\{\(e\) => update\('([^']+)', e\.target\.value\)\} onBlur=\{scBlur\('([^']+)'\)\}/g
s = s.replace(re, (_, k1, k2) => {
  if (k1 !== k2) throw new Error(`mismatch ${k1} ${k2}`)
  return `onChange={scInput('${k1}')}`
})
fs.writeFileSync(p, s)
