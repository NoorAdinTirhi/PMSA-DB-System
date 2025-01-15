const mysql = require('mysql')
const express = require('express')
const path = require('path')
const bodyparaer = require('body-parser')
const fs = require('fs')
const pdf = require('html-pdf')
const ejs = require('ejs')
const subProcess = require('child_process')
    // const audit = require('express-requests-logger')

const { stat,
        authUser,
        verifyUser, 
        registerSession,
        registerUser, 
        deleteUser } = require('./authentication/auth')
        
const { mainPage_varialbes,
        activityPage_variables, 
        allMembers_variables, 
        allTrainers_variables, 
        blackList_variables, 
        localActivity_variables, 
        nationalActivity_variables,
        certificate_variables } = require('./constants/CONSTANTS')

const { mainPageInformer, 
        resetLC, 
        allMembersInformer, 
        allActivitiesInformer, 
        allTrainersInformer, 
        updateAction,  
        getUserInfo, 
        updateLCStartTerm, 
        blackListInformer, 
        nationalActivityInformer,
        localActivityInformer,
        getActivityCat,
        addActivity,
        searchMember,
        addNewMem,
        editMem,
        deleteMem,
        searchTrainer,
        editTrainer,
        searchMemberActivity,
        searchMemberDelete,
        deleteParticipants,
        addParticipants,
        editActivity,
        html2PDF,
        sendToAllParticipants       } = require('./utility/dataHandling')


// let privelegeList = JSON.parse(fs.readFileSync('./constants/CONSTANTS.json'))


app = express()

app.set('view engine', 'ejs')

app.use(bodyparaer.urlencoded({
    extended: true
}))

app.use(express.static(path.join(__dirname, './public')))
    // app.use(audit())
console.log(__dirname)
var con;
//TODO add ajax to the ejs files


//TODO implement Nablus members event
//TODO implement Jerusalem members event
//TODO implement Gaza members event
//TODO implement PPU members event
//TODO implement HU members event
//TODO implement Jenin members event
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
    try{
        authUser(username, password, con, function(stat) {
            if (stat == 0) {
                registerSession(username, password, con, function(regStat) {
                    if (regStat == 1) {
                        res.status(500);
                        res.render(fileName, { login_string: "Internal Server Error" })
                        return
                    }
                    mainPageInformer(username, con, mainPage_varialbes, function(data) {
                        res.render("main", data);
                    })
                    return
                })
            } else if (stat == 1) {
                res.render(fileName, { login_string: "You have entered the wrong password" })
            } else if (stat == 2) {
                res.render(fileName, { login_string: "User not registered" })
            } else {
                res.render(fileName, { login_string: "Internal Server Error" })
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request; error has been logged, please make this known so it can be fixed')
    }
    
})

app.post("/mainPage", function(req, res) {
    const fileName = 'login'
    var username = req.body.username
    var password = req.body.password
    try{
        mainPageInformer(username, con, mainPage_varialbes, function(data) {
            res.render("main", data);
        })
                    
            
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request; error has been logged, please make this known so it can be fixed')
    }
})



// /////////////////////////
// Main page GET processing
//TODO: make sure to do authentication
app.post("/resetMember", function(req, res) {
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return 
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    if (req.body.position != "Secgen"){
        res.status(401)
        res.send("Unauthorized: You do not have authorization to reset members")
        return
    }
    
    try{
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
                return
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
                return
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
                return
            }
        
            //succesful, setting all local users to inactive
            resetLC(req.body.localCommittee, con, function(flag) {
                if (flag == 3) {
                    res.status(500)
                    res.send("Internal Server Error, Database issue")
                    return
                } else if (flag == 5) {
                    res.status(401)
                    res.send("Unauthorized, national secgen is not allowed to reset members")
                    return
                }
                updateLCStartTerm(req.body.username, con, function(flag){
                    if (flag == 0){
                        res.status(200)
                        res.send(`succesfully reset all ${req.body.localCommittee.toUpperCase()} members`)
                        updateAction(req.body.username, "Reset Local Members", con, function(flag) {
                        if (flag == 0)
                            console.log("success")
                        else
                            console.log("failure")
                        })
                        return
                    }
                    res.status(500)
                    res.send("Internal Server Error")
                })
            })
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request; error has been logged, please make this known so it can be fixed')
    }
    
})

app.post("/registerUser", function(req, res) {
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return 
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }
    
    try{
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
                return
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
                return
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
                return
            }
            registerUser(req.body, con, function(flag) {
                if (flag == 5) {
                    res.status(401)
                    res.send("Unauthorized, only National Secgen can add new Users")
                } else if (flag == 1) {
                    res.status(501)
                    res.send("Username already exists or Position is already Held")
                } else {
                    res.status(200)
                    res.send("New User Succesfully Added")
                }
            })
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request; error has been logged, please make this known so it can be fixed')
    }
    
})

app.post("/deleteUser", function(req, res) {
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return 
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }
    
    try{
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
                return
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
                return
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
                return
            }
            getUserInfo(req.body.userToDelete, con, function(info, flag) {
                if (flag == 2) {
                    res.status(401)
                    res.send("user doesn't exist")
                    return
                } else if (flag != 0) {
                    res.status(500)
                    res.send("Internal Server Error")
                    return
                }
                if (info.LC == "national" && info.position == "Secgen") {
                    res.status(401)
                    res.send("Unauthorized, must not delete National Secgen")
                    return
                } 
                //succesful, deleting user
                deleteUser(req.body, con, function(flag) {
                    if (flag == 5) {
                        res.status(401)
                        res.send("Unauthorized, only National Secgen can add delete Users")
                        return
                    } else if (flag == 1) {
                        res.status(501)
                        res.send("Username already exists or Position is already Held")
                        return
                    }
                    res.status(200)
                    res.send(`succesfully Deleted User ${req.body.userToDelete}`)

                }) 
            })
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request; error has been logged, please make this known so it can be fixed')
    }
})

app.post("/allMembers", function(req, res) {
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return 
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    try{
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
                return
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
                return
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
                return
            }
            //succesful, attempt to get information and render the allMembers page
            allMembersInformer(req.body.username, req.body.memNum, req.body.direction, allMembers_variables, req.body.filterLC,  req.body.chosenLC ,con, function(flag, data) {
                if (flag == 3) {
                    res.status(500)
                    res.send("Internal Server Error, Database issue")
                    return
                }
                res.status(200)
                res.render('tier2/allMembers', data)
            })
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request; error has been logged, please make this known so it can be fixed')
    }
    
    
})

app.post("/allTrainers", function(req, res) {
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return 
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    try{
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
                return
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
                return
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
                return
            }
            allTrainersInformer(req.body.username, req.body.memNum, req.body.direction, allTrainers_variables, req.body.filterLC, req.body.chosenLC, con, function(flag, data){
                if (flag == 3) {
                    res.status(500)
                    res.send("Internal Server Error, Database issue")
                    return
                }
                res.status(200)
                res.render('tier2/allTrainers', data)
            })
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request; error has been logged, please make this known so it can be fixed')
    }
       
})

app.post("/allActivities", function(req, res) {
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return 
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    try{
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
                return
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
                return
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
                return
            }
            allActivitiesInformer(req.body.username, activityPage_variables, req.body.filter, req.body.curFilter, con, function(flag, data) {
                if (flag == 3) {
                    res.status(500)
                    res.send("Internal Server Error, Database issue")
                    return
                }
                res.status(200)
                res.render('tier2/allActivities', data)
            })
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request; error has been logged, please make this known so it can be fixed')
    }
})


app.post("/blackList", function(req, res){
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return 
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    try{
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
                return
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
                return
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
                return
            }
            blackListInformer(req.body.username, blackList_variables, con, function(flag, data){
                if (flag == 0){
                       res.status(200);
                       res.render("tier2/blackList", data)
                       return
                }
                res.status(500)
                res.send("Internal Server Error")

            })

        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request; error has been logged, please make this known so it can be fixed')
    }  
})


app.post("/selectAct", function(req, res){
   
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return 
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    try{
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
                return
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
                return
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
                return
            }

            if (req.body.position != "Secgen"){
                res.status(401)
                res.send("Unauthorized, CBD cannot add activities, their only concern is trainers")
                return
            }

            if (req.body.activity){
                actID = req.body.activity
            }else{
                actID = req.body.actNum
            }
            getActivityCat(actID, con, function(flag, msg){
                if (flag == 3){
                    console.log(flag);
                    res.status(500)
                    res.send(msg)
                    return
                }

                if (msg == "national"){
                    if (!(msg == req.body.localCommittee || req.body.localCommittee == "national")){
                        res.status(401)
                        res.send("Unauthorized, local Secgens cannot activities events outside their Local Committee")
                        return
                    }

                    nationalActivityInformer(req.body.username,  req.body.direction, req.body.currentMemNum, actID, nationalActivity_variables, con, function (flag, data){
                        if (flag != 0){
                            console.log(flag)
                            res.status(400)
                            res.send("Failed")
                            return
                        }
                        res.render("tier2/tier3/nationalActivity", data)
                    })


                }else{
                    localActivityInformer(req.body.username, req.body.direction, req.body.currentMemNum, actID, localActivity_variables, con, function (flag, data){
                        if (flag != 0){
                            console.log(flag)
                            res.status(400)
                            res.send("Failed")
                            return
                        }
                        console.log(data)
                        res.render("tier2/tier3/localActivity", data)
                    })
                }

            })
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request; error has been logged, please make this known so it can be fixed')
    }
    
    
})



app.post("/addActivity", function(req, res) {
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return 
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    try{
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
       
            if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
                return
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
                return
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
                return
            }

            if (req.body.position != "Secgen"){
                res.status(401)
                res.send("Unauthorized, CBD cannot add activities, their only concern is trainers")
                return
            }

            addActivity(req.body, req.body.localCommittee, con, function(flag){
                if (flag !== 0){
                    res.status(500)
                    res.send("Internal Server Error")
                    return
                }

                allActivitiesInformer(req.body.username, activityPage_variables, req.body.localCommittee, req.body.curFilter, con, function(flag, data) {
                    if (flag == 3) {
                        res.status(500)
                        res.send("Internal Server Error, Database issue")
                        return
                    }

                    updateAction(req.body.username, `Added a new Activity : ${req.body.activityName}`, con, function(flag){
                        if (flag != 0){
                            res.status(500)
                            res.send("Internal Server Error, unable to update action, but activity was added")
                            return
                        }

                        res.status(200)
                        res.render('tier2/allActivities', data)
                    })

                })

            })

        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request; error has been logged, please make this known so it can be fixed')
    }
})


app.post("/searchMember", function(req, res){
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    if (!req.body.memNum) {
        res.status(401)
        res.send("bad request")
        return
    }

    LC = (req.body.filter)
    try{
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 0) {
                searchMember(req.body, con, function(flag, data){
                    if (flag == 0){
                        res.status(200)
                        res.send(JSON.stringify(data))
                    }else{
                        res.status(500)
                        res.send("Internal Server Error")
                    }
                })
            } else if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request; error has been logged, please make this known so it can be fixed')
    }
    
})

app.post("/addNewMem",function(req,res){
    
    con
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return
    }

    if(!req.body.username){
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    if (!req.body.memNum) {
        res.status(401)
        res.send("bad request")
        return
    }

    try{
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 0) {
                addNewMem(req.body, con, function(flag, data){
                    if (flag == 0){
                        res.status(200)
                        res.send("Succesfully registered member")
                        return
                    }
                    res.status(500)
                    res.send("Bad Request, Make sure that the user is not already registered")
                    return
                })
            } else if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
            }
        })  
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request; error has been logged, please make this known so it can be fixed')
    }
            
})

app.post("/editMem",function(req,res){
    
    con
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return
    }

    if(!req.body.username){
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    if (!req.body.memNum) {
        res.status(401)
        res.send("bad request")
        return
    }
    if (req.body.position != "Secgen" || (req.body.localCommittee != "national" && req.body.localCommittee != req.body.memLC)){
        res.status(401)
        res.send("Unauthorized: You do not have access to that member")
        return
    }

    try{
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
           if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
                return
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
                return
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
                return
            }
            editMem(req.body, con, function(flag){
                if (flag == 0){
                    res.status(200)
                    res.send("Member Succesfully Edited")
                    return
                }
                res.status(500)
                res.send("Bad Request, Make sure that the user number is not already registered")
                return
            })   
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request; error has been logged, please make this known so it can be fixed')
    }
                   
})

app.post("/deleteMem", function (req,res){
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return
    }

    if(!req.body.username){
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    if (!req.body.memNum) {
        res.status(401)
        res.send("bad request")
        return
    }
    if (req.body.position != "Secgen" || (req.body.localCommittee != "national" && req.body.localCommittee != req.body.memLC)){
        res.status(401)
        res.send("Unauthorized: You do not have access to that member")
        return
    }

    try{
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
           if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
                return
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
                return
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
                return
            }
            deleteMem(req.body.memNum, con, function(flag){
                if (flag == 0){
                    res.status(200)
                    res.send(`${req.body.memNum} Succesfully Deleted`)
                    return
                }
                res.status(500)
                res.send("Bad Request, Make sure that the user number is not already registered")
                return
            })   
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request; error has been logged, please make this known so it can be fixed')
    }
})


app.post("/editTrainer",function(req,res){
    
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return
    }

    if(!req.body.username){
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    if (!req.body.memNum) {
        res.status(401)
        res.send("bad request")
        return
    }

    if (req.body.position != "CBD" || (req.body.localCommittee != "national" && req.body.localCommittee != req.body.memLC)){
        res.status(401)
        res.send("Unauthorized: You do not have access to that trainer")
        return
    }

    try{
       verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
           if (flag == 1) { 
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
                return
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
                return
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
                return
            }
            editTrainer(req.body, con, function(flag){
                if (flag == 0){
                    res.status(200)
                    res.send("Member Succesfully Edited")
                    return
                }
                res.status(500)
                res.send("Bad Request, Make sure that the user number is not already registered")
                return
            })   
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request; error has been logged, please make this known so it can be fixed')
    }               
})

app.post("/searchTrainer", function(req, res){

    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    if (!req.body.memNum) {
        res.status(401)
        res.send("bad request")
        return
    }

    if (req.body.position != "CBD" && !(req.body.localCommittee == "national" && req.body.position == "Secgen")){
        res.status(401)
        res.send("Unauthorized: You do not have access to trainers")
        return
    }

    try{
        LC = (req.body.filter)
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
                return
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
                return
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
                return
            }
            searchTrainer(req.body, con, function(flag, data){
                if (flag == 0){
                    res.status(200)
                    res.send(JSON.stringify(data))
                }else{
                    res.status(500)
                    res.send("Internal Server Error")
                }
            })
        })  
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request')
    }
            
})

app.post("/searchAddToAct", function(req, res){
    
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    if (req.body.position != "Secgen"){
        res.status(401)
        res.send("Unauthorized: You do not have access to activities or members")
        return
    }


    try{
        LC = (req.body.filter)
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 0) {
                searchMemberActivity(req.body, con, function(flag, data){
                    if (flag == 0){
                        res.status(200)
                        console.log(data)
                        res.send(JSON.stringify(data))
                        return
                    }
                    res.status(500)
                    res.send("Internal Server Error")

                })
            } else if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request')
    }
    
})

app.post("/searchDeleteToAct", function(req, res){
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    if (req.body.position != "Secgen"){
        res.status(401)
        res.send("Unauthorized: You do not have access to activities or members")
        return
    }

    try{
        LC = (req.body.filter)
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 0) {
                searchMemberDelete(req.body, con, function(flag, data){
                    if (flag == 0){
                        res.status(200)
                        res.send(JSON.stringify(data))
                        return
                    }
                    res.status(500)
                    res.send("Internal Server Error")

                })
            } else if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request')
    }
})

app.post("/deleteParticipants", function(req, res){
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    if (req.body.position != "Secgen"){
        res.status(401)
        res.send("Unauthorized: You do not have access to activities or members")
        return
    }
    
    try{
        LC = (req.body.filter)
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 0) {
                deleteParticipants(req.body, con, function(flag, data){
                    if (flag != 0){
                        res.status(500)
                        res.send("Internal Server Error")
                        return
                    }
                    updateAction(req.body.username, `removed participants from activity number :${req.body.actNum}`, con, function(flag){
                        if (flag != 0){
                            res.status(201)
                            res.send(`Succesfully Removed Selected Members From Activity Number :${req.body.actNum}, but failed to update action`)
                        }
                        res.status(200)
                        res.send(`Succesfully Removed Selected Members From Activity Number :${req.body.actNum}`)
                    })
                })
            } else if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request')
    }
})

app.post("/addParticipants", function(req, res){
    
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    if (req.body.position != "Secgen"){
        res.status(401)
        res.send("Unauthorized: You do not have access to activities or members")
        return
    }
        
    try{
        LC = (req.body.filter)
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 0) {
                addParticipants(req.body, con, function(flag, data){
                    if (flag != 0){
                        res.status(500)
                        res.send("Internal Server Error")
                        return
                    }
                    updateAction(req.body.username, `added participants from activity number :${req.body.actNum}`, con, function(flag){
                        if (flag != 0){
                            res.status(201)
                            res.send(`Succesfully Added Selected Members From Activity Number :${req.body.actNum}, but failed to update action`)
                        }
                        res.status(200)
                        res.send(`Succesfully Added Selected Members From Activity Number :${req.body.actNum}`)
                    })
                })
            } else if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request')
    }
})

app.post("/editActivity", function(req, res){
    console.log(req.body)
    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }
    
    if (req.body.position != "Secgen"){
        res.status(401)
        res.send("Unauthorized: You do not have access to activities or members")
        return
    }
    
    try{
        LC = (req.body.filter)
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 0) {
                console.log(`flag == ${flag}`)
                editActivity(req.body, con, function(flag, data){
                    if (flag != 0){
                        res.status(500)
                        res.send("Internal Server Error")
                        return
                    }
                    console.log(`flag == ${flag}`)
                    updateAction(req.body.username, `edited activity number :${req.body.actNum}`, con, function(flag){
                        if (flag != 0){
                            res.status(201)
                            res.send(`edited activity :${req.body.actNum}, but failed to update action`)
                            return
                        }
                        res.status(200)
                        res.send(`Succesfully Edited Activity Number :${req.body.actNum}`)
                        console.log(`flag == ${flag}`)
                    })
                })
            } else if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request')
    } 
})

app.post("/printCert", function(req, res){

    console.log(req.body)

    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    if (req.body.position != "Secgen"){
        res.status(401)
        res.send("Unauthorized: You do not have access to activities or members")
        return
    }

    try{
        LC = (req.body.filter)
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 0) {
                html2PDF(req.body.actNum, req.body.currentMemNum, certificate_variables, con, function(flag, data){
                    if (flag == 0){
                        console.log("DONE")
                        res.sendFile(__dirname + `/certificates/${data.certCode}_cropped.pdf`)
                    }
                })
            } else if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
            } else if (flag == 5) {
                res.status(401)
                res.send("Member not registered for activity")
            }
        }) 
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request')
    }
})

app.post("/printAllCert", function(req, res){

    console.log("recieved")

    if (!req.body) {
        res.status(400)
        res.send("Incomplete Request")
        return
    }

    if (!req.body.username) {
        res.render("login", { login_string: "you need to login to make a request" })
        return
    }

    if (!req.body.cipher) {
        res.status(401)
        res.send("Your request does not include a cipher, please login and use the website as intended")
        return
    }

    if (req.body.position != "Secgen"){
        res.status(401)
        res.send("Unauthorized: You do not have access to activities or members")
        return
    }

    try{
        LC = (req.body.filter)
        verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
            if (flag == 0) {
                sendToAllParticipants(req.body.actNum, certificate_variables, con, function(flag){
                    if (flag == 0){
                        res.status(200)
                        res.send("Succesfully Started Creating Certificates, Should Send to All Participants")
                        return
                    }
                    res.status(501)
                    res.send("Internal Server Error, Cannot Send Emails")
                })
            } else if (flag == 1) {
                //failed, bad cipher
                res.status(401)
                res.send("Your request has a bad cipher")
            } else if (flag == 2) {
                res.status(401)
                res.send("user not registered")
            } else if (flag == 3) {
                res.status(500)
                res.send("Internal Server Error")
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/logs/error.txt', '-------------------------------------------------------------------------------')
        res.status(400)
        res.send('Bad Request')
    }
     
})





app.get("*.css", function(req, res) {
    //HTML Files Path
    const options = {
        root: path.join(__dirname)
    }
    const fileName = req.originalUrl


    res.sendFile(fileName, options)
})

app.get("*.png", function(req, res) {
    //HTML Files Path
    const options = {
        root: path.join(__dirname)
    }
    const fileName = req.originalUrl


    res.sendFile(fileName, options)
})

app.get("*.jpeg", function(req, res) {
    //HTML Files Path
    const options = {
        root: path.join(__dirname)
    }
    const fileName = req.originalUrl


    res.sendFile(fileName, options)
})

app.get("*.ttf", function(req, res) {
    //HTML Files Path
    const options = {
        root: path.join(__dirname)
    }
    const fileName = req.originalUrl
    console.log(fileName)

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


