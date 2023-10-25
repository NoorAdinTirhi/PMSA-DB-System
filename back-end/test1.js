const scissors = require('scissors')
const fs = require('fs')
const subProcess = require('child_process')

subProcess.exec("pdfcrop --margins '0 -65 0 0' result.pdf output.pdf")

// doc.pipe(fs.createWriteStream('result.pdf'))