const crypto = require('node:crypto')
const secret = new Uint8Array(32);
crypto.getRandomValues(secret);
const secretString = String(secret)
const hashString = String(crypto.createHmac('sha3-256', secret).update("noor"+"fur124365").digest('hex'))
const current_time = new Date();
console.log(hashString)
console.log(current_time)
console.log(secretString)