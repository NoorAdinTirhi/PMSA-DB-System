const mysql = require('mysql')
const express = require('express')
const path = require('path')
const bodyparaer = require('body-parser')

app = express()

app.set('view engine', 'ejs')

app.use(bodyparaer.urlencoded({
    extended:true
}))

var con;

app.get('/login', function(reg, res) {
    //HTML Files Path
    const options = {
        root: path.join(__dirname,"/../front-end/")
    }
    console.log(__dirname);

    const fileName = 'login'

    res.render("login", {login_string: "Please enter Username and password"})
})


app.post("/login", function(req, res){
    var username = req.body.username
    var password = req.body.password

    console.log(`***\nusername : ${username}\n password : ${password}\n****`)
    //try to login to establish mysql connection
    con = mysql.createConnection({
        host: "localhost",
        user: username,
        password: password,
    })
    con.connect(function(err){
        if(err){
            res.render("login", {login_string: "login unsuccesful"})
        }else{
            console.log("Connected")
            res.render("apprprivelage.ejs");
        } 
    })
    

})

app.listen(8081, function(err){
    if(err) throw err
    console.log("server is listening at 8081")
})