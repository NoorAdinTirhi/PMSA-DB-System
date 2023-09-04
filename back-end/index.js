const mysql = require('mysql')
const express = require('express')
const path = require('path')
const bodyparaer = require('body-parser')
const fs = require('fs')

let privelegeList = JSON.parse(fs.readFileSync('./constants/CONSTANTS.json'))


app = express()

app.set('view engine', 'ejs')

app.use(bodyparaer.urlencoded({
    extended: true
}))

var con;


// /////////////////////////
// login page stuff (GET the login page and well as POST the username and password)
app.get('/login', function(reg, res) {
    //HTML Files Path
    const options = {
        root: path.join(__dirname, "/../front-end/")
    }
    console.log(__dirname);

    const fileName = 'login'

    res.render(fileName, { login_string: "Please enter Username and password" })
})

app.post("/login", function(req, res) {
    var username = req.body.username
    var password = req.body.password
    console.log(`***\nusername : ${username}\n password : ${password}\n****`)
        //try to login to establish mysql connection
    con = mysql.createConnection({
        host: "localhost",
        user: username,
        password: password,
    })
    con.connect(function(err) {
        if (err) {
            res.render("login", { login_string: "login unsuccesful" })
        } else {
            console.log("Connected")
                // TODO: figure out what's the privelege of the user and assign it
            res.render("main", { privelege: "secgen", user: username });
        }
    })
})

// /////////////////////////
// Main page GET processing
app.get("/allMembers", function(reg, res) {
    res.render('allMembers', {})
})

app.listen(8081, function(err) {
    if (err) throw err
    console.log("server is listening at 8081")
})