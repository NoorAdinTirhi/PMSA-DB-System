const scissors = require('scissors')
const fs = require('fs')

doc = scissors('result.pdf')

doc.crop(0,65,0,0)

doc.pdfStream('result.pdf')
console.log(doc)
// doc.pipe(fs.createWriteStream('result.pdf'))