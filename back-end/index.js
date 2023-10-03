const mysql = require('mysql')
const express = require('express')
const path = require('path')
const bodyparaer = require('body-parser')
const fs = require('fs')
// const audit = require('express-requests-logger')

const { stat, authUser, registerSession } = require('./authentication/auth')
const { mainPage_varialbes, activityPage_variables } = require('./constants/CONSTANTS')
const {mainPageInformer} = require('./utility/dataHandling')


// let privelegeList = JSON.parse(fs.readFileSync('./constants/CONSTANTS.json'))


app = express()

app.set('view engine', 'ejs')

app.use(bodyparaer.urlencoded({
    extended: true
}))

app.use(express.json())
// app.use(audit())

var con;
//TODO add ajax to the ejs files


//TODO implement Nablus members event
//TODO implement Jerusalem members event
//TODO implement Gaza members event
//TODO implement PPU members event
//TODO implement HU members event
//TODO implement Jinin members event
//TODO implement cipher confirmation
//TODO implement user registration


//Connect to Database and listen on port 8081
app.listen(8081, function(err) {
    if (err) throw err
    con = mysql.createConnection({
        host: "localhost",
        user: 'root',
        password: 'fur124365',
        database: 'PMSA_DB',
    })
    //TODO: check that user is in databse
    con.connect(function(err) {
        if (err) {
            throw err;
        } else {
            console.log("Connected")
        }
    })

    console.log("server is listening at 8081")
    console.log(" ")
})

//send the login page to all that require it
app.get('/login', function(req, res) {
    //HTML Files Path
    const options = {
        root: path.join(__dirname, "/../front-end/")
    }
    const fileName = 'login'

    res.render(fileName, { login_string: "Please enter Username and password" })
})

// check login credential and register the start of the session
app.post("/login", function(req, res) {
    const fileName = 'login'
    var username = req.body.username
    var password = req.body.password
    
    authUser(username, password, con, function(stat){
        if(stat == 0){
        registerSession(username, con, function (regStat){
            if (regStat == 1){
                res.status(500);
                res.render(fileName, {login_string : "Internal Server Error"})
            }else{
                mainPageInformer(username, con, mainPage_varialbes, function(data){
                    console.log(data)
                    res.render("main", data);
                })
            }
        })
        }else if (stat == 1){
            console.log(`${stat}`)
            res.render(fileName, {login_string : "You have entered the wrong password"})
        }else if (stat == 2){
            console.log(`${stat}`)
            res.render(fileName, {login_string : "User not registered"})
        }else{
            console.log(`${stat}`)
            res.render(fileName, {login_string : "Internal Server Error"})
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

app.post("/nextMember", function(reg, res) {
    console.log(req.body.username)
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
