const crypto = require('node:crypto')

var stat;

//check if the request is made by a user
function verifyUser(username, cipher, LC, position, con, callback) {
    con.query(`SELECT * FROM Users WHERE Username = "${username}"`, function(err, result) {
        if (err) {
            return callback(3)
        }

        if (result.length > 0) {
            if (result[0].Hmac == cipher && result[0].Locality == LC && result[0].Position == position) {
                return callback(0)
            } else {
                return callback(1)
            }
        } else {
            return callback(2)
        }
    })
}

// check if user is registered and validate the password useing hmac sha3-256
function authUser(username, pwd, con, callback) {
    con.query(`SELECT * FROM Users WHERE Username = "${username}"`, function(err, result) {

        if (err) {
            //My SQL Error
            return callback(3)
        }

        if (result.length > 0) {
            content = username + pwd;
            key = new Uint8Array(32)
            let i = 0;
            result[0].Hkey.split(',').forEach(number => {
                key[i] = Number(number);
                i++;
            })

            const hash = String(crypto.createHmac('sha3-256', key).update(username + pwd).digest('hex'));
            if (hash == result[0].Hmac) {
                //means success
                return callback(0)
            } else {
                //means wrong password
                return callback(1)
            }
        } else {
            //means user is not registered
            return callback(2)
        }
    })
}

//register a new Hmac for the user to be used throughout this session
function registerSession(username, pwd, con, callback) {
    const secret = new Uint8Array(32);
    crypto.getRandomValues(secret);
    const secretString = String(secret)
    const hashString = String(crypto.createHmac('sha3-256', secret).update(username + pwd).digest('hex'))
    const current_time = new Date();
    con.query(`UPDATE Users Set Hkey = '${secretString}', Hmac = '${hashString}', LastActionTime = '${current_time.getFullYear()}-${current_time.getMonth()+1}-${current_time.getDate()}' WHERE Username = '${username}'`, function(err, result, fields) {
        if (err) {
            //something went wrong
            return callback(1);
        } else {
            return callback(0);
        }
    })

}

function deleteUser(body, con, callback) {
    if (body.localCommittee.toUpperCase() == "NATIONAL" && body.position.toUpperCase() == 'SECGEN') {
        con.query(`DELETE FROM Users WHERE Username = '${body.userToDelete}'`, function(err) {
            if (err) {
                return callback(1)
            } else {
                return callback(0)
            }
        })
    } else {
        return callback(5)
    }

}

//function to register User
function registerUser(body, con, callback) {
    if (body.localCommittee.toUpperCase() == "NATIONAL" && body.position.toUpperCase() == 'SECGEN') {
        const secret = new Uint8Array(32);
        crypto.getRandomValues(secret);
        const secretString = String(secret)
        const hashString = String(crypto.createHmac('sha3-256', secret).update(body.nUsername + body.nPassword).digest('hex'))
        const current_time = new Date();
        con.query(`INSERT INTO Users(Username,Hkey,Hmac,Position,Locality) VALUES ('${body.nUsername}','${secretString}', '${hashString}', '${body.nPosition}', '${body.nLC}')`, function(err, result, fields) {
            if (err) {
                //something went wrong
                return callback(1);
            } else {
                return callback(0);
            }
        })

    } else
        return callback(5)

}


module.exports = {
    stat,
    authUser,
    registerSession,
    verifyUser,
    deleteUser,
    registerUser
}