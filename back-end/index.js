const mysql = require('mysql')
const express = require('express')
const path = require('path')
const bodyparaer = require('body-parser')
const fs = require('fs')
const pdf = require('html-pdf')
const ejs = require('ejs')
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
        nationalActivity_variables } = require('./constants/CONSTANTS')

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
        addActivity                             } = require('./utility/dataHandling')


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

    authUser(username, password, con, function(stat) {
        if (stat == 0) {
            registerSession(username, password, con, function(regStat) {
                if (regStat == 1) {
                    res.status(500);
                    res.render(fileName, { login_string: "Internal Server Error" })
                } else {
                    mainPageInformer(username, con, mainPage_varialbes, function(data) {
                        res.render("main", data);
                    })
                }
            })
        } else if (stat == 1) {
            res.render(fileName, { login_string: "You have entered the wrong password" })
        } else if (stat == 2) {
            res.render(fileName, { login_string: "User not registered" })
        } else {
            res.render(fileName, { login_string: "Internal Server Error" })
        }
    })


})

// /////////////////////////
// Main page GET processing
//TODO: make sure to do authentication
app.post("/resetMember", function(req, res) {
    if (req.body) {
        if (req.body.username) {
            if (req.body.cipher) {
                verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
                    console.log(`verify flag = ${flag}`)
                    if (flag == 0) {
                        //succesful, setting all local users to inactive
                        resetLC(req.body.localCommittee, con, function(flag) {
                            if (flag == 3) {
                                res.status(500)
                                res.send("Internal Server Error, Database issue")
                            } else if (flag == 5) {
                                res.status(401)
                                res.send("Unauthorized, national secgen is not allowed to reset members")
                            } else {
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
                                    }else{
                                        res.status(500)
                                        res.send("Internal Server Error")
                                    }
                                })
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
            } else {
                res.status(401)
                res.send("Your request does not include a cipher, please login and use the website as intended")
            }
        } else {
            res.render("login", { login_string: "you need to login to make a request" })
        }
    } else {
        res.status(400)
        res.send("Incomplete Request")
    }
})

app.post("/registerUser", function(req, res) {
    if (req.body) {
        if (req.body.username) {
            if (req.body.cipher) {
                verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
                    console.log(`verify flag = ${flag}`)
                    if (flag == 0) {
                        //succesful, setting all local users to inactive
                        registerUser(req.body, con, function(flag) {
                            if (flag == 5) {
                                res.status(401)
                                res.send("Unauthorized, only National Secgen can add new Users")
                            } else if (flag == 1) {
                                res.status(501)
                                res.send("Username already exists or Position is already Held")
                            } else {
                                res.status(200)
                                res.send(`succesfully registered new User ${req.body.nUsername}`)
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
            } else {
                res.status(401)
                res.send("Your request does not include a cipher, please login and use the website as intended")
            }
        } else {
            res.render("login", { login_string: "you need to login to make a request" })
        }
    } else {
        res.status(400)
        res.send("Incomplete Request")
    }
})

app.post("/deleteUser", function(req, res) {
    console.log(req.body)
    if (req.body) {
        if (req.body.username) {
            if (req.body.cipher) {
                verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
                    console.log(`verify flag = ${flag}`)
                    if (flag == 0) {
                        getUserInfo(req.body.userToDelete, con, function(info, flag) {
                            if (flag == 0) {
                                if (info.LC == "national" && info.position == "Secgen") {
                                    res.status(401)
                                    res.send("Unauthorized, must not delete National Secgen")
                                } else {
                                    //succesful, deleting user
                                    deleteUser(req.body, con, function(flag) {
                                        if (flag == 5) {
                                            res.status(401)
                                            res.send("Unauthorized, only National Secgen can add delete Users")
                                        } else if (flag == 1) {
                                            res.status(501)
                                            res.send("Username already exists or Position is already Held")
                                        } else {
                                            res.status(200)
                                            res.send(`succesfully Deleted User ${req.body.userToDelete}`)
                                        }
                                    })
                                }
                            } else if (flag == 2) {
                                res.status(401)
                                res.send("user doesn't exist")
                            } else {
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
            } else {
                res.status(401)
                res.send("Your request does not include a cipher, please login and use the website as intended")
            }
        } else {
            res.render("login", { login_string: "you need to login to make a request" })
        }
    } else {
        res.status(400)
        res.send("Incomplete Request")
    }
})

app.post("/allMembers", function(req, res) {
    if (req.body) {
        if (req.body.username) {
            if (req.body.cipher) {
                if (req.body.memNum && req.body.direction) {
                    verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
                        if (flag == 0) {
                            //succesful, attempt to get information and render the allMembers page
                            allMembersInformer(req.body.username, req.body.memNum, req.body.direction, allMembers_variables, req.body.filterLC,  req.body.chosenLC ,con, function(flag, data) {
                                if (flag == 3) {
                                    res.status(500)
                                    res.send("Internal Server Error, Database issue")
                                } else {
                                    res.status(200)
                                    res.render('tier2/allMembers', data)
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
                } else {
                    res.status(401)
                    res.send("bad request")
                }
            } else {
                res.status(401)
                res.send("Your request does not include a cipher, please login and use the website as intended")
            }
        } else {
            res.render("login", { login_string: "you need to login to make a request" })
        }
    } else {
        res.status(400)
        res.send("Incomplete Request")
    }
})

app.post("/allTrainers", function(req, res) {
    if (req.body) {
        if (req.body.username) {
            if (req.body.cipher) {
                if (req.body.memNum) {
                    verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
                        if (flag == 0) {
                            //succesful, attempt to get information and render the allMembers page
                            allTrainersInformer(req.body.username, req.body.memNum, allTrainers_variables, req.body.localCommittee, req.body.currentFilter, con, function(flag, data) {
                                if (flag == 3) {
                                    res.status(500)
                                    res.send("Internal Server Error, Database issue")
                                } else {
                                    res.status(200)
                                    res.render('tier2/allTrainers', data)
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
                } else {
                    res.status(401)
                    res.send("bad request")
                }
            } else {
                res.status(401)
                res.send("Your request does not include a cipher, please login and use the website as intended")
            }
        } else {
            res.render("login", { login_string: "you need to login to make a request" })
        }
    } else {
        res.status(400)
        res.send("Incomplete Request")
    }
})

app.post("/allActivities", function(req, res) {
    console.log(req.body)
    if (req.body) {
        if (req.body.username) {
            if (req.body.cipher) {
                verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
                    if (flag == 0) {
                        //succesful, attempt to get information and render the allMembers page
                        allActivitiesInformer(req.body.username, activityPage_variables, req.body.filter, req.body.curFilter, con, function(flag, data) {
                            if (flag == 3) {
                                res.status(500)
                                res.send("Internal Server Error, Database issue")
                            } else {
                                res.status(200)
                                res.render('tier2/allActivities', data)
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
            } else {
                res.status(401)
                res.send("Your request does not include a cipher, please login and use the website as intended")
            }
        } else {
            res.render("login", { login_string: "you need to login to make a request" })
        }
    } else {
        res.status(400)
        res.send("Incomplete Request")
    }
})

app.post("/blackList", function(req, res){
    if (req.body) {
        if (req.body.username) {
            if (req.body.cipher) {
                verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
                    if (flag == 0) {
                       blackListInformer(req.body.username, blackList_variables, con, function(flag, data){
                        if (flag == 0){
                            res.status(200);
                            res.render("tier2/blackList", data)
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
            } else {
                res.status(401)
                res.send("Your request does not include a cipher, please login and use the website as intended")
            }
        } else {
            res.render("login", { login_string: "you need to login to make a request" })
        }
    } else {
        res.status(400)
        res.send("Incomplete Request")
    }
})

app.post("/selectAct", function(req, res){
    
    if (req.body) {
        if (req.body.username) {
            if (req.body.cipher) {
                verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
                    if (flag == 0) {
                        if (req.body.position = "Secgen"){
                            getActivityCat(req.body.activity, con, function(flag, msg){
                                if (flag == 0){
                                   
                                    if (msg == "national"){
                                        if (msg == req.body.localCommittee || req.body.localCommittee == "national"){
                                            console.log(req.body.activity)
                                            nationalActivityInformer(req.body.username, req.body.memNum, req.body.activity, nationalActivity_variables, con, function (flag, data){
                                                if (flag == 0){
                                                    res.render("tier2/tier3/nationalActivity", data)
                                                }else {
                                                    console.log(flag)
                                                    console.log(data)
                                                    res.status(400)
                                                    res.send("Failed")
                                                }
                                            })
                                        }else{
                                            res.status(401)
                                            res.send("Unauthorized, local Secgens cannot activities events outside their Local Committee")
                                        }
                                        
                                    }else{
                                        localActivityInformer(req.body.username, req.body.memNum, req.body.activity, nationalActivity_variables, con, function (flag, data){
                                            if (flag == 0){
                                                res.render("tier2/tier3/localActivity", data)
                                            }else {
                                                console.log(flag)
                                                console.log(data)
                                                res.status(400)
                                                res.send("Failed")
                                            }
                                        })
                                    }
                                }else if (flag == 3){
                                    console.log(flag);
                                    res.status(500)
                                    res.send(msg)
                                }
                            })
                        }else{
                            res.status(401)
                            res.send("Unauthorized, CBD cannot view activities, their only concern is trainers")
                        }
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
            } else {
                res.status(401)
                res.send("Your request does not include a cipher, please login and use the website as intended")
            }
        } else {
            res.render("login", { login_string: "you need to login to make a request" })
        }
    } else {
        res.status(400)
        res.send("Incomplete Request")
    }
})



app.post("/addActivity", function(req, res) {
    console.log(req.body)
    if (req.body) {
        if (req.body.username) {
            if (req.body.cipher) {
                verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
                    if (flag == 0) {
                        if (req.body.position = "Secgen"){
                            addActivity(req.body, req.body.localCommittee, con, function(flag){
                                if (flag == 0){
                                    allActivitiesInformer(req.body.username, activityPage_variables, req.body.localCommittee, req.body.curFilter, con, function(flag, data) {
                                    if (flag == 3) {
                                        res.status(500)
                                        res.send("Internal Server Error, Database issue")
                                    } else {
                                        updateAction(req.body.username, `Added a new Activity : ${req.body.activityName}`, con, function(flag){
                                            if (flag == 0){
                                                res.status(200)
                                                res.render('tier2/allActivities', data)
                                            }else{
                                                res.status(500)
                                                res.send("Internal Server Error, unable to update action, but activity was added")
                                            }
                                        })
                                    }
                                })
                                }else{
                                    res.status(500)
                                    res.send("Internal Server Error")
                                }
                            })
                        }else{
                            res.status(401)
                            res.send("Unauthorized, CBD cannot add activities, their only concern is trainers")
                        }
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
            } else {
                res.status(401)
                res.send("Your request does not include a cipher, please login and use the website as intended")
            }
        } else {
            res.render("login", { login_string: "you need to login to make a request" })
        }
    } else {
        res.status(400)
        res.send("Incomplete Request")
    }
})


app.post("/nextMember", function(req, res){
    console.log(req.body)
    if (req.body) {
        if (req.body.username) {
            if (req.body.cipher) {
                if (req.body.memNum) {
                    LC = (req.body.filter)
                    verifyUser(req.body.username, req.body.cipher, req.body.localCommittee, req.body.position, con, function(flag) {
                        if (flag == 0) {
                            //succesful, attempt to get information and render the allMembers page
                            allMembersInformer(req.body.username, req.body.memNum, allMembers_variables, req.body.filterLC, con, function(flag, data) {
                                if (flag == 3) {
                                    res.status(500)
                                    res.send("Internal Server Error, Database issue")
                                } else {
                                    res.status(200)
                                    res.render('tier2/allMembers', data)
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
                } else {
                    res.status(401)
                    res.send("bad request")
                }
            } else {
                res.status(401)
                res.send("Your request does not include a cipher, please login and use the website as intended")
            }
        } else {
            res.render("login", { login_string: "you need to login to make a request" })
        }
    } else {
        res.status(400)
        res.send("Incomplete Request")
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


app.get("/printCert", function(req, res) {
    console.log("sent")
    ejs.renderFile("views/certificates/SCORE.ejs", { participantName: "noor", activityName: "noorification", actStartDate: "17-09-2023", actEndDate: "17-10-2023", participentPosition: "organizer", certCode: "A4F412F" }, function(err, data) {

        if (err) {
            res.send(err)
            console.log(err)
        } else {
            let options = {
                height: "2250px",
                width: "1591px"
            }
            res.send(data)
            pdf.create(data, options).toFile("report.pdf", function(err, data) {
                if (err) {
                    res.send(err)
                    console.log(err)
                } else {
                    console.log(__dirname)
                }
            })
        }
    })

})