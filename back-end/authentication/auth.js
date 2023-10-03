
const crypto = require('node:crypto')

var stat;

// check if user is registered and validate the password useing hmac sha3-256
function authUser(username,pwd, con, callback) {
    con.query(`SELECT * FROM Users WHERE Username = "${username}"`, function(err, result) {
        
        if (err){
            //My SQL Error
            return callback(3)
        }
        
        if (result.length > 0){
            content = username + pwd;
            key = new Uint8Array(32)
            let i = 0;
            result[0].Hkey.split(',').forEach(number =>{
                key[i] = Number(number);
                i++;
            })
            const hash = String(crypto.createHmac('sha3-256', key).update("noor"+"fur124365").digest('hex'));
            
            if (hash == result[0].Hmac){
                //means success
                return callback(0)
            } else {
                //means wrong password
                return callback(1)
            }
        }else{
            //means user is not registered
            return callback(2)
        }
    })
}

//register a new Hmac for the user to be used throughout this session
function registerSession(username, con, callback){
    const secret = new Uint8Array(32);
    crypto.getRandomValues(secret);
    const secretString = String(secret)
    const hashString = String(crypto.createHmac('sha3-256', secret).update("noor"+"fur124365").digest('hex'))
    let stat = 0;
    con.query(`UPDATE Users Set Hkey = '${secretString}', Hmac = '${hashString}' WHERE Username = '${username}'`, function(err, result, fields) {
        if (err){
            //something went wrong
            return callback(1);
        } else{
            return callback(0);
        }
    })
    
}


module.exports = {
    stat,
    authUser,
    registerSession
}