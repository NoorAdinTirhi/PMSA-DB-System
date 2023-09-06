const mysql = require('mysql')
const express = require('express')
const path = require('path')
const bodyparaer = require('body-parser')
const fs = require('fs')
const { authUser } = require('./authentication/auth')
const { mainPage_varialbes, activityPage_variables } = require('./constants/CONSTANTS')

let privelegeList = JSON.parse(fs.readFileSync('./constants/CONSTANTS.json'))


app = express()

app.set('view engine', 'ejs')

app.use(bodyparaer.urlencoded({
    extended: true
}))

app.use(express.json())

var con;


// /////////////////////////
// login page stuff (GET the login page and well as POST the username and password)
app.get('/login', function(req, res) {
    //HTML Files Path
    const options = {
        root: path.join(__dirname, "/../front-end/")
    }
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
            mainPage_varialbes.user = username
            res.render('main', mainPage_varialbes)
        }
    })
})

// /////////////////////////
// Main page GET processing
//TODO: make sure to do authentication
app.post("/allMembers", function(req, res) {
    res.render('tier2/allMembers')
    console.log(`***\nusername : ${req.body.username}\n `)
})

app.post("/allActivities", function(req, res) {
    console.log(`***\nusername : ${req.body.username}\n `)
    res.render('tier2/allActivities', activityPage_variables)
})

app.post("/selectAct", function(req, res) {
    console.log(req.body.activity)
})

app.post("/allTrainers", function(req, res) {
    res.render('tier2/allTrainers')
    console.log(`***\nusername : ${req.body.username}\n `)
})


app.get("*.css", function(req, res) {
    //HTML Files Path
    const options = {
        root: path.join(__dirname, "/views")
    }
    const fileName = req.originalUrl


    res.sendFile(fileName, options)
})

app.get("/scripts/*", function(req, res) {
    //HTML Files Path
    const options = {
        root: path.join(__dirname, "/views")
    }

    const fileName = req.originalUrl


    res.sendFile(fileName, options)
})

app.listen(8081, function(err) {
    if (err) throw err
    console.log("server is listening at 8081")
})