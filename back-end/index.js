const mysql = require('mysql')
const express = require('express')
const path = require('path')
const bodyparaer = require('body-parser')

app = express()

app.use(bodyparaer.urlencoded({
    extended:true
}))

app.get('/login', function(reg, res) {
    const options = {
        root: path.join(__dirname)
    }

    const fileName = 'login.html'
    
    res.sendFile(fileName, options, function(err){
        if(err){
            runInNewContext(err);
        } else {
            console.log('sent : ', fileName)
        }
    })
})


app.post("/login", function(req, res){
    var username = req.body.username
    var password = req.body.password

    console.log(`***\nusername : ${username}\n password : ${password}\n****`)

    
})

app.listen(8081, function(err){
    if(err) throw err
    console.log("server is listening at 8081")
})


