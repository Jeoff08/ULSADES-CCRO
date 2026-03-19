import fs from 'fs'
const p = process.argv[2] || 'src/pages/courtDecree/CourtDecreeForm.jsx'
const skip = new Set((process.argv[3] || 'lcr1aSex,lcr2aSex,affectedDocument').split(',').filter(Boolean))
const lines = fs.readFileSync(p, 'utf8').split('\n')
const re = /onChange=\{\(e\) => update\('([^']+)', e\.target\.value\)\}/g
const out = lines.map((line) => {
  if (line.includes('<select')) return line
  return line.replace(re, (full, key) => {
    if (skip.has(key)) return full
    if (full.includes('scBlur')) return full
    return `${full} onBlur={scBlur('${key}')}`
  })
})
fs.writeFileSync(p, out.join('\n'))
