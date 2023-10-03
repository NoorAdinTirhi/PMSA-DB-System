const crypto = require('node:crypto')

const key = new Uint8Array(32);
crypto.getRandomValues(key)
const str1 = String(key)
const tempKey = new Uint8Array(32);
let i = 0;
str1.split(',').forEach(number =>{
    tempKey[i] = Number(number);
    i++;
})


const hash = crypto.createHmac('sha3-256', key).update("noor"+"fur124365").digest('hex');
console.log("noor"+"fur124365")
username = 'noor'
let HMAC = String(hash);
Hkey = str1;
position = 'SECGEN'
locality = 'National'

console.log(`("${username}", "${HMAC}", "${Hkey}", "${position}", "${locality}")`)


function test1(){
    return 5;
}
console.log(test1())