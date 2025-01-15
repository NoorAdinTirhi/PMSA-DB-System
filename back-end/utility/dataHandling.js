const { query } = require("express")
const subProcess = require('child_process')
const puppeteer = require('puppeteer');
const ejs = require('ejs')
const fs = require('fs')
var nodemailer = require('nodemailer');

// query the DB to get required information for the mainpage
function mainPageInformer(username, con, pageData, callback) {
    try{
        con.query(`SELECT *, DATE_FORMAT(StartDate,'%Y/%m/%d') AS StartDate1, DATE_FORMAT(LastActionTime,'%Y/%m/%d') AS LastActionTime1 FROM Users;`, function(err, results) {
        getUserInfo(username, con, function(userData, errorStatus) {
            if (errorStatus == 0) {
                Object.keys(pageData).forEach(key => {
                    pageData[key] = "unassigned"
                })
                pageData.user = userData.user
                pageData.position = userData.position
                pageData.userLC = userData.LC;
                pageData.cipher = userData.cipher

                pageData.usersLog = [];
                // console.log(results)
                results.forEach(row => {
                    varNameStartDate = `${row.Locality}StartDate`

                    pageData[varNameStartDate] = row.StartDate1;

                    pageData.usersLog.push({
                        "position": `${row.Locality.toUpperCase()} ${row.Position}`,
                        "lastLogDate": (row.LastActionTime1) ? row.LastActionTime1 : "unassigned",
                        "lastChange": (row.LastAction) ? row.LastAction : "unassigned",
                        "username": row.Username
                    })


                    if (row.StartDate1 == null)
                        pageData[varNameStartDate] = "unassigned"
                })

                return callback(pageData)
            } else {
                Object.keys(pageData).forEach(key => {
                    pageData[key] = "unassigned"
                })
            }
        })
    })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
    
}

//function for reseting LC
function resetLC(LC, con, callback) {
    try{
        if (LC.toUpperCase() == "NATIONAL")
            return callback(5)
        con.query(`UPDATE M  SET MembershipStatus = 'Inactive' where LC = '${LC}'`, function(err, results) {
            if (err) {
                console.log(err)
                return callback(3);
            } else {
                return callback(0);
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
    
}

function updateAction(username, action, con, callback) {
    try{
        console.log(username, action)
        con.query(`UPDATE Users  SET LastAction = '${action}' where Username = '${username}'`, function(err, results) {
            if (err) {
                console.log(err)
                return callback(3);
            } else {
                return callback(0);
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
}
function updateLCStartTerm(username, con, callback){
    try{
        const current_time = new Date();
        con.query(`UPDATE Users SET StartDate = '${String(current_time.getFullYear())}-${String(current_time.getMonth()+1)}-${String(current_time.getDate())}' WHERE Username = '${username}'`, function(err){
            if (err){
                console.log(err)
                return callback(1)
            }else{
                return callback(0)
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
    
}

function blackListInformer(username, pageData, con, callback){
    try{
        con.query(`SELECT CONCAT(M.FirstName, " ",M.FatherName, " ", M.GFatherName, " ", M.FamilyName) AS Name, MBl.Status, MBl.Reason  FROM MBl, M WHERE M.UniID = MBl.UniID`, function(err, results){
            if (err){
                console.log(err)
                return callback(3, pageData);
            }else{ 
                getUserInfo(username, con, function(userData, flag){
                    if (flag != 0 ){
                        console.log(flag);
                        return callback(3, pageData);
                    }else{
                        pageData.user = userData.user
                        pageData.position = userData.position
                        pageData.userLC = userData.LC
                        pageData.cipher = userData.cipher
                        pageData.blackLisitngs = [];
                        results.forEach(row => {
                            pageData.blackLisitngs.push(
                                {
                                    Name : row.Name,
                                    BlackListStatus : row.Status,
                                    BlackListDescription : row.Reason
                                }
                            )
                        })
                        return callback(0, pageData)
                    }

                })
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
    
}
    


function allMembersInformer(username, number, direciton, pageData, LC, excplicitLC, con, callback) {
    try{
        data = ""
        console.log(excplicitLC)
        if (excplicitLC.toUpperCase() == "NATIONAL")
            chosenLC = ""
        else
            chosenLC = ` AND LC = '${excplicitLC}'`
        console.log(`SELECT * FROM M WHERE UniID ${(direciton == "next")?">":"<"} ${number}` + chosenLC + ` ORDER BY UniID ${(direciton=="next")?"":"DESC"} LIMIT 1`)
        con.query(`SELECT * FROM M WHERE UniID ${(direciton == "next")?">":"<"} ${number}` + chosenLC + ` ORDER BY UniID ${(direciton=="next")?"":"DESC"} LIMIT 1`, function(err, results) {
            if (err) {
                console.log(err)
                return callback(3, data);
            } else {
                Object.keys(pageData).forEach(key => {
                    temp = pageData[key]
                    if (typeof temp == "string")
                        pageData[key] = "no Members"
                    else
                        pageData[key] = [];
                })

                getUserInfo(username, con, function(userData,err){
                    pageData.user = userData.user
                    pageData.position = userData.position
                    pageData.userLC = userData.LC
                    pageData.cipher = userData.cipher
                    pageData.uniNum = 0;
                    if (results.length > 0) {
                        pageData.engFname = results[0].FirstName
                        pageData.engFather = results[0].FatherName
                        pageData.engGfather = results[0].GFatherName
                        pageData.engLname = results[0].FamilyName
                        pageData.arabFname = results[0].AFirstName
                        pageData.arabFather = results[0].AFatherName
                        pageData.arabGfather = results[0].AGFatherName
                        pageData.arabLname = results[0].AFamilyName
                        pageData.areaCode = results[0].PhoneNo.slice(0, 3)
                        pageData.phoneNo = results[0].PhoneNo.slice(3)
                        pageData.email = results[0].E_mail
                        pageData.firstYear = results[0].UniStartYear
                        pageData.facebook = results[0].Facebook_Link
                        pageData.uniNum = results[0].UniID
                        pageData.localCommittee = results[0].LC
                        pageData.memStatus = results[0].MembershipStatus
                        pageData.curMemNumber = results[0].UniID
                        pageData.gender = results[0].Gender
                        pageData.chosenLC = excplicitLC

                        checkTrainerStatus(results[0].UniID, con, function(flag, trainerStatus) {
                            if (flag == 0) {
                                pageData.trainerStatus = trainerStatus
                                checkBlackListStatus(results[0].UniID, con, function(flag, blStatus, blReason) {
                                    if (flag == 0) {
                                        pageData.blacklistStatus = blStatus
                                        pageData.blacklistReason = blReason
                                        getNationalActivites(results[0].UniID, con, function(flag, natActivities) {
                                            console.log(flag)
                                            if (flag == 0 || flag == 1) {
                                                pageData.nationalActivities = []
                                                natActivities.forEach(row => {
                                                    pageData.nationalActivities.push(row.Aname)
                                                })
                                                getLocalActivites(results[0].UniID, con, function(flag, localActivities) {
                                                    console.log(flag)
                                                    if (flag == 0 || flag == 1) {
                                                        pageData.localActivities = [];
                                                        localActivities.forEach(row => {
                                                            pageData.localActivities.push(row.Aname)
                                                        })
                                                        return callback(0, pageData)
                                                    } else {
                                                        return callback(flag, pageData)
                                                    }
                                                })
                                            } else {
                                                return callback(flag, pageData)
                                            }
                                        })
                                    } else
                                        return callback(flag, pageData)
                                })
                            } else
                                return callback(flag, pageData)
                        })
                    }else{
                        console.log(`SELECT * FROM M WHERE UniID ${(direciton == "next")?">":"<"} ${(direciton == "next")?"0":"2147483646"}` + chosenLC + ` ORDER BY UniID ${(direciton=="next")?"":"DESC"} LIMIT 1`)
                        con.query(`SELECT * FROM M WHERE UniID ${(direciton == "next")?">":"<"} ${(direciton == "next")?"0":"2147483646"}` + chosenLC + ` ORDER BY UniID ${(direciton=="next")?"":"DESC"} LIMIT 1`, function(err, results) {
                            if (err){
                                return callback(3, pageData)
                            }else if (results.length > 0){
                                pageData.engFname = results[0].FirstName
                                pageData.engFather = results[0].FatherName
                                pageData.engGfather = results[0].GFatherName
                                pageData.engLname = results[0].FamilyName
                                pageData.arabFname = results[0].AFirstName
                                pageData.arabFather = results[0].AFatherName
                                pageData.arabGfather = results[0].AGFatherName
                                pageData.arabLname = results[0].AFamilyName
                                pageData.areaCode = results[0].PhoneNo.slice(0, 3)
                                pageData.phoneNo = results[0].PhoneNo.slice(3)
                                pageData.email = results[0].E_mail
                                pageData.firstYear = results[0].UniStartYear
                                pageData.facebook = results[0].Facebook_Link
                                pageData.uniNum = results[0].UniID
                                pageData.localCommittee = results[0].LC
                                pageData.memStatus = results[0].MembershipStatus
                                pageData.curMemNumber = results[0].UniID
                                pageData.gender = results[0].Gender
                                pageData.chosenLC = excplicitLC
                                checkTrainerStatus(results[0].UniID, con, function(flag, trainerStatus) {
                                    if (flag == 0) {
                                        pageData.trainerStatus = trainerStatus
                                        checkBlackListStatus(results[0].UniID, con, function(flag, blStatus, blReason) {
                                            if (flag == 0) {
                                                pageData.blacklistStatus = blStatus
                                                pageData.blacklistReason = blReason
                                                getNationalActivites(results[0].UniID, con, function(flag, natActivities) {
                                                    if (flag == 0) {
                                                        pageData.nationalActivities = []
                                                        natActivities.forEach(row => {
                                                            pageData.nationalActivities.push(row.Aname)
                                                        })
                                                        getLocalActivites(results[0].UniID, con, function(flag, localActivities) {
                                                            if (flag == 0) {
                                                                pageData.localActivities = [];
                                                                localActivities.forEach(row => {
                                                                    pageData.localActivities.push(row.Aname)
                                                                })
                                                                return callback(flag, pageData)
                                                            } else {
                                                                return callback(flag, pageData)
                                                            }
                                                        })
                                                    } else {
                                                        return callback(flag, pageData)
                                                    }
                                                })
                                            } else
                                                return callback(flag, pageData)
                                        })
                                    } else
                                        return callback(flag, pageData)
                                })
                            }else{
                                Object.keys(pageData).forEach(key => {
                                temp = pageData[key]
                                if (typeof temp == "string")
                                    pageData[key] = "no Members"
                                else
                                    pageData[key] = [];
                                })
                                pageData.user = userData.user
                                pageData.position = userData.position
                                pageData.userLC = userData.LC
                                pageData.cipher = userData.cipher
                                pageData.chosenLC = excplicitLC
                                pageData.uniNum = 0;
                                return callback(0, pageData)
                            }
                        })
                    }
                })
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
    
}


function allTrainersInformer(username, number, direciton, pageData, LC, excplicitLC, con, callback) {
    try{
        data = ""
        if (excplicitLC.toUpperCase() == "NATIONAL")
            chosenLC = ""
        else
            chosenLC = ` AND LC = '${excplicitLC}'`

        console.log(`SELECT *, DATE_FORMAT(GradDate,'%Y/%m/%d') AS GradDate1 FROM M, Mt WHERE M.UniID = Mt.UniID and M.UniID ${(direciton == "next")?">":"<"} ${number}` + chosenLC + " ORDER BY M.UniID LIMIT 1")
        con.query(`SELECT *, DATE_FORMAT(GradDate,'%Y/%m/%d') AS GradDate1 FROM M, Mt WHERE M.UniID = Mt.UniID and M.UniID ${(direciton == "next")?">":"<"} ${number}` + chosenLC + " ORDER BY M.UniID LIMIT 1", function(err, results) {
            if (err) {
                console.log(err)
                return callback(3, data);
            } else {
                Object.keys(pageData).forEach(key => {
                    temp = pageData[key]
                    if (typeof temp == "string")
                        pageData[key] = "no Members"
                    else
                        pageData[key] = [];
                })

                getUserInfo(username, con, function(userData,err){
                    pageData.user = userData.user
                    pageData.position = userData.position
                    pageData.userLC = userData.LC
                    pageData.cipher = userData.cipher
                    pageData.uniNum = 0;
                    if (results.length > 0) {
                        pageData.engFname = results[0].FirstName
                        pageData.engFather = results[0].FatherName
                        pageData.engGfather = results[0].GFatherName
                        pageData.engLname = results[0].FamilyName
                        pageData.arabFname = results[0].AFirstName
                        pageData.arabFather = results[0].AFatherName
                        pageData.arabGfather = results[0].AGFatherName
                        pageData.arabLname = results[0].AFamilyName
                        pageData.areaCode = results[0].PhoneNo.slice(0, 3)
                        pageData.phoneNo = results[0].PhoneNo.slice(3)
                        pageData.email = results[0].E_mail
                        pageData.firstYear = results[0].UniStartYear
                        pageData.facebook = results[0].Facebook_Link
                        pageData.uniNum = results[0].UniID
                        pageData.localCommittee = results[0].LC
                        pageData.memStatus = results[0].MembershipStatus
                        pageData.curMemNumber = results[0].UniID
                        pageData.gender = results[0].Gender
                        pageData.chosenLC = excplicitLC
                        pageData.trainerCategory = results[0].Category
                        pageData.gradActivity = results[0].GradActivity
                        pageData.gradDate = results[0].GradDate1
                        pageData.trainerStatus = results[0].TStatus

                        checkBlackListStatus(results[0].UniID, con, function(flag, blStatus, blReason) {
                            console.log(flag)
                            if (flag == 0 || flag == 1) {
                                pageData.blacklistStatus = blStatus
                                pageData.blacklistReason = blReason
                                return callback(0, pageData)
                            } else
                                return callback(flag, pageData)
                        })
                    }else{

                        console.log(`SELECT *, DATE_FORMAT(GradDate,'%Y/%m/%d') AS GradDate1 FROM M, Mt WHERE M.UniID = Mt.UniID and M.UniID ${(direciton == "next")?">":"<"} ${(direciton == "next")?"0":"2147483646"}` + chosenLC + ` ORDER BY M.UniID ${(direciton=="next")?"":"DESC"} LIMIT 1`)
                        con.query(`SELECT *, DATE_FORMAT(GradDate,'%Y/%m/%d') AS GradDate1 FROM M, Mt WHERE M.UniID = Mt.UniID and M.UniID ${(direciton == "next")?">":"<"} ${(direciton == "next")?"0":"2147483646"}` + chosenLC + ` ORDER BY M.UniID ${(direciton=="next")?"":"DESC"} LIMIT 1`, function(err, results) {
                            if (err){
                                console.log(err)
                                return callback(3, pageData)
                            }else if (results.length > 0){
                                pageData.engFname = results[0].FirstName
                                pageData.engFather = results[0].FatherName
                                pageData.engGfather = results[0].GFatherName
                                pageData.engLname = results[0].FamilyName
                                pageData.arabFname = results[0].AFirstName
                                pageData.arabFather = results[0].AFatherName
                                pageData.arabGfather = results[0].AGFatherName
                                pageData.arabLname = results[0].AFamilyName
                                pageData.areaCode = results[0].PhoneNo.slice(0, 3)
                                pageData.phoneNo = results[0].PhoneNo.slice(3)
                                pageData.email = results[0].E_mail
                                pageData.firstYear = results[0].UniStartYear
                                pageData.facebook = results[0].Facebook_Link
                                pageData.uniNum = results[0].UniID
                                pageData.localCommittee = results[0].LC
                                pageData.memStatus = results[0].MembershipStatus
                                pageData.curMemNumber = results[0].UniID
                                pageData.gender = results[0].Gender
                                pageData.chosenLC = excplicitLC
                                pageData.trainerCategory = results[0].Category
                                pageData.gradActivity = results[0].GradActivity
                                pageData.gradDate = results[0].GradDate1
                                pageData.trainerStatus = results[0].TStatus

                                checkBlackListStatus(results[0].UniID, con, function(flag, blStatus, blReason) {
                                    console.log(flag)
                                    if (flag == 0 || flag == 1) {
                                        pageData.blacklistStatus = blStatus
                                        pageData.blacklistReason = blReason
                                        return callback(0, pageData)
                                    } else
                                        return callback(flag, pageData)
                                })
                            }else{

                                Object.keys(pageData).forEach(key => {
                                temp = pageData[key]
                                if (typeof temp == "string")
                                    pageData[key] = "no Members"
                                else
                                    pageData[key] = [];
                                })
                                pageData.user = userData.user
                                pageData.position = userData.position
                                pageData.userLC = userData.LC
                                pageData.cipher = userData.cipher
                                pageData.chosenLC = excplicitLC
                                pageData.uniNum = 0;
                                return callback(0, pageData)
                            }
                        })
                    }
                })
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
}



function allActivitiesInformer(username, pageData, LC, curFilter,con, callback) {
    try{
        data = ""
        if (curFilter != LC){
            if (LC.toUpperCase() == "NATIONAL") {
                secondTable = "Na"
                chosenLC = ""
                nat = true
                queryStr = `SELECT A.Aname, A.ActivityID, A.Committee FROM A${ ", " + secondTable} WHERE ${secondTable}.ActivityID = A.ActivityID ${(nat)?(""):("AND " + "La.LC = " + LC.toLowerCase())}`
            }else {
                secondTable = "La"
                chosenLC = ` WHERE LC = '${LC}'`
                nat = false
                queryStr = `SELECT A.Aname, A.ActivityID, A.Committee FROM A${ ", " + secondTable} WHERE ${secondTable}.ActivityID = A.ActivityID ${(nat)?(""):("AND " + "La.LC = " + `'${LC.toLowerCase()}'`)}`
            }
            pageData.filter = LC; 
        }else{
            queryStr = "SELECT A.Aname, A.ActivityID, A.Committee FROM A"
            pageData.filter = "all";
        }
        console.log(queryStr)
        con.query(queryStr, function(err, results) {
            if (err) {
                console.log(err)
                callback(3, pageData)
            } else {
                getUserInfo(username, con, function(userData, err) {
                    console.log(err)
                    pageData.user = userData.user
                    pageData.position = userData.position
                    pageData.userLC = userData.LC
                    pageData.cipher = userData.cipher

                    pageData.allActivities = []
                    results.forEach(row => {
                        temp = { actID: row.ActivityID, committee: row.Committee.toLowerCase(), actName: row.Aname }
                        pageData.allActivities.push(temp)
                    })
                    return callback(0, pageData)
                })

            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
}
//useful function getting current user's info
function getUserInfo(username, con, callback) {
    try{
        con.query(`SELECT * FROM Users WHERE Username = "${username}"`, function(err, results) {
            data = { "user": "", "LC": "", "position": "", "cipher": "" }
            if (err) {
                //error in query
                return callback(data, 1)
            } else {
                if (results.length > 0) {
                    data.user = username;
                    data.LC = results[0].Locality;
                    data.position = results[0].Position
                    data.cipher = results[0].Hmac
                    return callback(data, 0)
                } else {
                    //error in data
                    return callback(data, 2)
                }
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
    
}

function getMemberActivityInfo(memNum, direction, activityID, con, callback) {
    try{
        data=""
        con.query(`SELECT *, CONCAT(M.FirstName, " ",M.FatherName, " ", M.GFatherName, " ", M.FamilyName) AS Name FROM M_A, M WHERE M.UniID = M_A.UniID AND M_A.ActivityID = ${activityID} AND M.UniID ${(direction=="next")?">":"<"} ${memNum} ORDER BY M.UniID LIMIT 1`, function(err, results) {
            if (err) {
                //error in query
                console.log(err)
                return callback(1, data)
            } else {
                if (results.length > 0) {
                    data = results[0]
                    data.trainerCategory = results[0].Category
                    data.gradActivity = results[0].GradActivity;
                    data.gradDate = results[0].GradDate1
                    return callback(0, data)
                }else{
                    con.query(`SELECT *, CONCAT(M.FirstName, " ",M.FatherName, " ", M.GFatherName, " ", M.FamilyName) AS Name FROM M_A, M WHERE M.UniID = M_A.UniID AND M_A.ActivityID = ${activityID} AND M.UniID ${(direction=="next")?">":"<"} ${(direction=="next")?"0":"2147483646"} ORDER BY M.UniID LIMIT 1`, function(err, results){
                        if(results.length > 0){
                            data = results[0]
                            data.trainerCategory = results[0].Category
                            data.gradActivity = results[0].GradActivity;
                            data.gradDate = results[0].GradDate1
                            return callback(0, data)
                        }else{
                            return callback(2, data)
                        }
                    })
                }
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
    
}


function getTrainerInfo(memNum, con, callback) {
    con.query(`SELECT * , DATE_FORMAT(GradDate,'%Y/%m/%d') AS GradDate1 FROM MT WHERE UniID = ${memNum}`, function(err, results) {
        data = { "user": "", "LC": "", "position": "", "cipher": "" }
        if (err) {
            //error in query
            return callback(1, data)
        } else {
            if (results.length > 0) {
                data.trainerCategory = results[0].Category
                data.gradActivity = results[0].GradActivity;
                data.gradDate = results[0].GradDate1
                return callback(0, data)
            } else {
                //error in data
                return callback(2, data)
            }
        }
    })
}

function checkTrainerStatus(uniNum, con, callback) {
    try{
        con.query(`SELECT * FROM M, Mt WHERE M.UniID = Mt.UniID AND M.UniID = ${uniNum}`, function(err, trainerResults) {
            if (err) {
                console.log(err)
                return callback(3, "")
            } else {
                if (trainerResults.length == 0) {
                    callback(0, "Inactive")
                } else {
                    callback(0, trainerResults[0].TStatus)
                }
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
    
}

function checkBlackListStatus(uniNum, con, callback) {
    try{
        con.query(`SELECT * FROM M,MBl where M.UniID = MBl.UniID AND M.UniID = ${uniNum}`, function(err, blackListResults) {
            if (err) {
                console.log(err)
                return callback(3, "")
            } else {
                if (blackListResults.length == 0) {
                    callback(0, "clear")
                } else {
                    callback(0, blackListResults[0].Status, blackListResults[0].Reason)
                }
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
    
}

function getNationalActivites(uniNum, con, callback) {
    try{
        console.log(`SELECT A.Aname, A.ActivityID, A.Committee FROM M_A, A WHERE M_A.ActivityID = A.ActivityID AND UniID = ${uniNum} AND A.ActivityID IN (SELECT Na.ActivityID FROM Na)`)
        con.query(`SELECT A.Aname, A.ActivityID, A.Committee FROM M_A, A WHERE M_A.ActivityID = A.ActivityID AND UniID = ${uniNum} AND A.ActivityID IN (SELECT Na.ActivityID FROM Na)`, function(err, results) {
            if (err) {
                console.log(err)
                return callback(3, results)
            } else {
                if (results > 0) {
                    return callback(0, results)
                } else {
                    return callback(1, results)
                }
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
    
}

function getLocalActivites(uniNum, con, callback) {
    try{
        con.query(`SELECT A.Aname, A.ActivityID, A.Committee FROM M_A, A WHERE M_A.ActivityID = A.ActivityID AND UniID = ${uniNum} AND A.ActivityID IN (SELECT La.ActivityID FROM La)`, function(err, results) {
            if (err) {
                console.log(err)
                return callback(3, results)
            } else {
                if (results > 0) {
                    return callback(0, results)
                } else {
                    return callback(1, results)
                }
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
    
}

function localActivityInformer(username, direction, memNum, ActivityID, pageData, con, callback) {
    try{
        con.query(`SELECT *, DATE_FORMAT(StartDate,'%Y/%m/%d') AS StartDate1, DATE_FORMAT(EndDate,'%Y/%m/%d') AS EndDate1 FROM A,La WHERE A.ActivityID >= '${ActivityID}' AND A.ActivityID = La.ActivityID ORDER BY A.ActivityID LIMIT 1`, function(err, results){
            if (err){
                console.log(err)
                return callback(3, pageData)
            }else{
                console.log(results)
                getUserInfo(username, con, function(userData, flag){
                    pageData.user = userData.user
                    pageData.position = userData.position
                    pageData.userLC = userData.LC
                    pageData.cipher = userData.cipher
                    if (flag != 0){
                        return callback(1, pageData)
                    }else{
                        if (results.length > 0){
                            pageData.activityName = results[0].Aname;
                            pageData.activityDescription = results[0].Adescription;
                            pageData.proposalLink = results[0].ProposalLink
                            pageData.reportLink = results[0].ReportLink
                            pageData.startDate = results[0].StartDate1
                            pageData.endDate = results[0].EndDate1
                            pageData.activityID = results[0].ActivityID
                            ActivityID = results[0].ActivityID
                            pageData.committeeName = results[0].Committee
                            console.log("before getLCParticipation")
                            pageData.nationalActivites = []
                            pageData.localActivites = []
                            getMemberActivityInfo(memNum, direction, ActivityID, con, function(flag, memData){
                                console.log("before getMemberActivityInfo " + flag)
                                if (flag != 0){
                                    if (flag == 2){
                                        Object.keys(pageData).forEach(key => {
                                            if ((typeof pageData[key] != "object") && ((pageData[key] == null || pageData[key] == undefined || pageData[key] == ""))){
                                                pageData[key] = "unassigned"
                                            }
                                        })
                                        pageData.particiapntNumber = 0 
                                        return callback(0, pageData)
                                    }else{
                                        return callback(6, pageData)
                                    }
                                }else if (flag == 0 ){
                                    pageData.participantName = memData.Name
                                    pageData.participantLocalCommittee = memData.LC
                                    pageData.participantYearOfStudy = memData.UniStartYear
                                    pageData.participantPhoneNO = memData.PhoneNo
                                    pageData.participantEmail = memData.E_mail
                                    pageData.participantFacebook = memData.Facebook_Link
                                    pageData.particiapntNumber = memData.UniID
                                    console.log("before getNationalActivites")

                                    getNationalActivites(memData.UniID, con, function(flag, NAdata){
                                        if (flag != 0 && flag != 1){
                                            return callback(4, pageData)
                                        }else{

                                            NAdata.forEach(element => {
                                                pageData.nationalActivites.push(element.Aname)
                                            })
                                            console.log("before getLocalActivites")
                                            getLocalActivites(memData.UniID, con, function(flag, LAdata){
                                                if (flag != 0 && flag != 1){
                                                    return callback(3, pageData)
                                                }else{

                                                    LAdata.forEach(element => {
                                                        pageData.localActivites.push(element.Aname)
                                                    })

                                                    return callback(0, pageData)                                                     
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }else{
                            Object.keys(pageData).forEach(key => {
                                if ((typeof pageData[key] != "object") && ((pageData[key] == null || pageData[key] == undefined || pageData[key] == ""))){
                                    pageData[key] = "unassigned"
                                }
                            }) 
                            return callback(0, pageData)
                        }
                    }
                })
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
    
}

function nationalActivityInformer(username, direction, memNum, ActivityID, pageData_original, con, callback) {
    try{
        console.log(memNum)
        con.query(`SELECT *, DATE_FORMAT(StartDate,'%Y/%m/%d') AS StartDate1, DATE_FORMAT(EndDate,'%Y/%m/%d') AS EndDate1 FROM A WHERE ActivityID >= '${ActivityID}' ORDER BY ActivityID LIMIT 1`, function(err, results){
            if (err){
                console.log(err)
                return callback(3, pageData)
            }else{
                pageData = {...pageData_original}
                getUserInfo(username, con, function(userData, flag){
                    pageData.user = userData.user
                    pageData.position = userData.position
                    pageData.userLC = userData.LC
                    pageData.cipher = userData.cipher
                    if (flag != 0){
                        return callback(1, pageData)
                    }else{
                        if (results.length > 0){
                            pageData.activityName = results[0].Aname;
                            pageData.activityDescription = results[0].Adescription;
                            pageData.proposalLink = results[0].ProposalLink
                            pageData.reportLink = results[0].ReportLink
                            pageData.startDate = results[0].StartDate1
                            pageData.endDate = results[0].EndDate1
                            pageData.activityID = results[0].ActivityID
                            ActivityID = results[0].ActivityID
                            pageData.committeeName = results[0].Committee
                            console.log("before getLCParticipation")
                            getLCParticipation(con , function(flag, data){
                                if (flag == 0){
                                    sum = 0;
                                    // data.forEach(row =>{
                                    //     sum += row.totalLCPart
                                    // })
                                    getNumberofNationalActivities(con, function(flag, count){
                                        if (flag == 0){
                                            sum = count.count;
                                            data.forEach(row => {
                                            pageData[`${row.LC}Percent`] =`${Math.round((row.totalLCPart/sum)*100)}%`
                                            }) 
                                        }else{
                                            sum = 1;
                                        }
                                    })

                                    pageData.involvedLC = []
                                    getInvolvedLC(ActivityID, con, function(flag, involvedLC){
                                        console.log(involvedLC)
                                        if (flag != 0){
                                            return callback(flag, pageData)
                                        }else{
                                            involvedLC.forEach(row=>{
                                                pageData.involvedLC.push(row.LC)
                                            })
                                            pageData.nationalActivites = []
                                            pageData.localActivites = []
                                             getMemberActivityInfo(memNum, direction, ActivityID, con, function(flag, memData){
                                                console.log("before getMemberActivityInfo " + flag)
                                                if (flag != 0){
                                                    if (flag == 2){
                                                        Object.keys(pageData).forEach(key => {
                                                            if ((typeof pageData[key] != "object") && ((pageData[key] == null || pageData[key] == undefined || pageData[key] == ""))){
                                                                pageData[key] = "unassigned"
                                                            }
                                                        }) 
                                                        pageData.particiapntNumber = 0
                                                        return callback(0, pageData)
                                                    }else{
                                                        return callback(6, pageData)
                                                    }
                                                }else if (flag == 0 ){
                                                    pageData.participantName = memData.Name
                                                    pageData.participantLocalCommittee = memData.LC
                                                    pageData.participantYearOfStudy = memData.UniStartYear
                                                    pageData.participantPhoneNO = memData.PhoneNo
                                                    pageData.participantEmail = memData.E_mail
                                                    pageData.participantFacebook = memData.Facebook_Link
                                                    pageData.particiapntNumber = memData.UniID
                                                    console.log("before getNationalActivites")

                                                    getNationalActivites(memData.UniID, con, function(flag, NAdata){
                                                        if (flag != 0 && flag != 1){
                                                            return callback(4, pageData)
                                                        }else{

                                                            NAdata.forEach(element => {
                                                                pageData.nationalActivites.push(element.Aname)
                                                            })
                                                            console.log("before getLocalActivites")
                                                            getLocalActivites(memData.UniID, con, function(flag, LAdata){
                                                                if (flag != 0 && flag != 1){
                                                                    return callback(3, pageData)
                                                                }else{

                                                                    LAdata.forEach(element => {
                                                                        pageData.localActivites.push(element.Aname)
                                                                    })  
                                                                    return callback(0, pageData)                                                     
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }else{
                                    return callback(5, pageData)
                                }
                            })
                        }else{
                            Object.keys(pageData).forEach(key => {
                                if ((typeof pageData[key] != "object") && ((pageData[key] == null || pageData[key] == undefined || pageData[key] == ""))){
                                    pageData[key] = "unassigned"
                                }
                            })
                            return callback(0, pageData)
                        }                    
                    }
                })
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
}

function getLCParticipation(con, callback){
    con.query(`SELECT tbl.LC, SUM(tbl.LCPart) AS totalLCPart FROM (SELECT LC, COUNT(*) AS LCPart FROM NaLC GROUP BY LC) tbl GROUP BY LC;`, function(err, results){
                data = [];
                if (err){
                    console.log(err)
                    return callback (3, data)
                }else{
                    return callback(0, results)
                }
               })
}

function getNumberofNationalActivities(con, callback){
    con.query(`SELECT COUNT(*) AS count FROM Na`, function(err, results){
        if (err){
            console.log(err)
            return callback(1,0)
        }else{
            return callback(0, results[0])
        }
    })
}

function getInvolvedLC(ActivityID ,con, callback){
    con.query(`SELECT LC from NaLC WHERE ActivityID = ${ActivityID}`, function(err, results){
        if (err){
            console.log(err)
            return callback(3, results)
        }else{
            return callback(0, results)
        }
    })
}
function getActivityCat(ActivityID, con, callback){
    con.query (`SELECT (${ActivityID} in (SELECT ActivityID FROM La)) AS isLocal, (${ActivityID} in (SELECT ActivityID FROM Na)) AS isNational, (SELECT LC FROM La WHERE ActivityID = ${ActivityID}) AS LC`, function(err, results){
        if (err){
            //MySQL Error
            console.log(err);
            return callback(3, "MySQL error")
        }else{
            if (results.length > 0){
                // this is an illegal case, activies are either national or local
                if (results[0].isLocal == results[0].isNational){
                    return callback(4, "Illegal Case")
                }else{
                    if (results[0].isLocal == 1)
                        return callback(0, results[0].isNational.LC)
                    else{
                        return callback(0, "national")
                    }
                }
            }else{
                // Activity Doesn't Exist
                return callback(2, "empty")
            }
        }
    })
}

function addActivity(body, localCommittee, con, callback){
    try{
        participatingLcsArr = [];
        Object.keys(body).forEach(key => {
            body[key] = body[key].replaceAll("'", "\\'")
        })
        if (localCommittee == "national"){
            body.participatingLCs = body.participatingLCs.slice(0,-1)
            participatingLcsArr = body.participatingLCs.split(",")
            queryStr1 = `INSERT INTO A ( Aname, Committee, Adescription, ProposalLink, ReportLink, StartDate, EndDate) VALUES ('${body.activityName}', '${body.committee}', '${body.activityDescription}', '${body.proposalLink}', '${body.reportLink}', '${body.startDate}', '${body.endDate}');`       
            queryStr2 = `INSERT INTO Na VALUES (LAST_INSERT_ID(),0)`;
            if (participatingLcsArr.length > 0){
                queryStr3 = "INSERT INTO NaLC VALUES"
            }
            participatingLcsArr.forEach(LC => {
                queryStr3 += `(LAST_INSERT_ID(), '${LC}'),`
            })
            queryStr3 = queryStr3.slice(0,-1)
        }else{
            queryStr1 = `INSERT INTO A ( Aname, Committee, Adescription, ProposalLink, ReportLink, StartDate, EndDate) VALUES ('${body.activityName}', '${body.committee}', '${body.activityDescription}', '${body.proposalLink}', '${body.reportLink}', '${body.startDate}', '${body.endDate}');`
            queryStr2 = `INSERT INTO La VALUES (LAST_INSERT_ID(), '${localCommittee}');`
        }
        con.query(queryStr1, function(err, results){
            if (err){
                console.log(err)
                return callback(3)
            }else{
                con.query(queryStr2, function(err){
                    if(err){
                        console.log(err)
                        con.query(`DELETE FROM A WHERE ActivityID = LAST_INSERT_ID()`)
                        return callback(3)
                    }else{
                        if(participatingLcsArr.length > 0){
                            con.query(queryStr3, function(err){
                                if (err){
                                    console.log(err)
                                    if (localCommittee == "national")
                                        con.query(`DELETE FROM Na WHERE ActivityID = LAST_INSERT_ID()`)
                                    else{
                                        con.query(`DELETE FROM La WHERE ActivityID = LAST_INSERT_ID()`)
                                    }
                                    return callback(3)
                                }else{
                                    return callback(0)
                                }
                        })}else{
                            return callback(0)
                        }
                    }
                })
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
    
}

function searchMember(body, con, callback){
    try{
        if (body.filterLC.toUpperCase() == "NATIONAL")
            chosenLC = ""
        else
            chosenLC = ` AND LC = '${body.filterLC}'`
        console.log(`SELECT UniID, CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) AS Name FROM M WHERE CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) LIKE '%${body.memberLike}%'` + chosenLC)
        con.query(`SELECT UniID, CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) AS Name FROM M WHERE CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) LIKE '%${body.memberLike}%'` + chosenLC, function(err, results){
            temp={}
            if (err){
                console.log(err)
                callback(3, data)
            }else{
                data=[]
                results.forEach(row => {
                    data.push({"memNum": row.UniID, "memName": row.Name})
                })
            
                console.log(data)
                callback(0, data)
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
    
}

function searchMemberActivity(body, con, callback){
    try{
        chosenLC = ` AND M.LC = IFNULL((SELECT La.LC FROM La WHERE La.ActivityID = ${body.actNum}), M.LC)`

        console.log(`SELECT UniID, CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) AS Name FROM M WHERE CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) LIKE '%${body.memberLike}%' AND UniID NOT IN (SELECT UniID FROM M_A WHERE ActivityID = ${body.actNum})` + chosenLC)
        con.query(`SELECT UniID, CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) AS Name FROM M WHERE CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) LIKE '%${body.memberLike}%' AND UniID NOT IN (SELECT UniID FROM M_A WHERE ActivityID = ${body.actNum})` + chosenLC, function(err, results){
            data=[]
            temp={}
            if (err){
                console.log(err)
                callback(3, data)
            }else{
                results.forEach(row => {
                    data.push({"memNum": row.UniID, "memName": row.Name})
                })
                console.log(data)
                callback(0, data)
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
    
}

function searchMemberDelete(body, con, callback){
    try{
        console.log(body)

        console.log(`SELECT UniID, CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) AS Name FROM M WHERE CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) LIKE '%${body.memberLike}%' AND UniID IN (SELECT UniID FROM M_A WHERE ActivityID = ${body.actNum})`)
        con.query(`SELECT UniID, CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) AS Name FROM M WHERE CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) LIKE '%${body.memberLike}%' AND UniID IN (SELECT UniID FROM M_A WHERE ActivityID = ${body.actNum})`, function(err, results){
            data=[]
            temp={}
            if (err){
                console.log(err)
                callback(3, data)
            }else{
                results.forEach(row => {
                    data.push({"memNum": row.UniID, "memName": row.Name})
                })
                console.log(data)
                callback(0, data)
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
    
}

function deleteParticipants(body, con, callback){
    try{
        console.log(body)
        searchExpression = ""

        if (!(body.addMemCb) || !(body.addMemCb.includes("on")))
            return callback(0)

        console.log(typeof body.addMemCb)

        if (typeof body.addMemCb != "string"){
            for (let i = 0; i < body.addMemCb.length; i++){
                if (body.addMemCb[i] == "on")
                    searchExpression += `UniID = ${body.memNum[i]} OR `
            }
            searchExpression = searchExpression.slice(0, -4);
        }else{
            if (body.addMemCb == "on")
                searchExpression = `UniID = ${body.memNum}`
        }

        queryStr = `DELETE FROM M_A WHERE ActivityID = ${body.actNum} AND (${searchExpression}) AND ('${body.localCommittee}' = 'national' OR '${body.localCommittee}' = (SELECT La.LC FROM La WHERE ActivityID = ${body.actNum}))`
        con.query(queryStr, function(err, results){
            if (err){
                console.log(err)
                return callback(3)
            }
            return callback(0)
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
}

function addParticipants(body, con, callback){
    try{
        console.log(body)
        values = ""

        console.log(typeof body.addMemCb)

        if (typeof body.name != "string"){
            for (let i = 0; i < body.uniNum.length; i++){
                values += `(${body.uniNum[i]}, ${body.actNum}, ${"0"}, '${body.roles[i]}'),`
            }
            values = values.slice(0, -1);
        }else{
                values = `(${body.uniNum}, ${body.actNum}, ${"0"}, '${body.roles}')`
        }
        console.log(body.localCommittee)

        con.query(`SELECT LC FROM La WHERE ActivityID = ${body.actNum}`, function(err, results){
            if (err){
                console.log(err)
                return callback(3)
            }else{
                if (results.length > 0){
                    if (results[0].LC != body.localCommittee && body.localCommittee != 'national')
                        return callback(2)
                }else if (body.localCommittee != 'national')
                    return callback(2)
                const queryStr = `INSERT INTO M_A VALUES ${values}`
                console.log(queryStr)
                con.query(queryStr, function(err){
                    if (err){
                        console.log(err)
                        return callback(3)
                    }
                    return callback(0)
                })
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
}

function addNewMem(body, con, callback){
    try{
        query1Str = `INSERT INTO M VALUES(${body.uniNum}, '${body.engFname}', '${body.engFather}',`
        + `'${body.engGfather}', '${body.engLname}', '${body.arabFname}', '${body.arabFather}',`
        + `'${body.arabGfather}', '${body.arabLname}', '${body.gender}', '${body.areaCode+body.phoneNo}',`
        + `'${body.email}', '${body.facebook}', ${body.firstYear}, '${body.memberStatus}',`
        + `'${(body.localCommittee=="national")?body.newLocalCommittee:body.localCommittee}')`
        console.log(query1Str)
        if (body.trainerStatus == 'active'){
            query2Str = `INSERT INTO Mt VALUES(${body.uniNum}, 'Not Yet Assigned','Not Yet Assigned','2022-09-17','active')`
        }

        con.query(query1Str, function(err){
            if (err){
                console.log(err)
                return callback(3)
            }

            if (body.trainerStatus != 'active')
                return callback(0)
            con.query(query2Str, function(err){
                if(err){
                    console.log(err)
                    con.query(`DELETE FROM M WHERE UniID = ${body.uniNum}`, function(err){
                        if(err)
                            console.log(err)
                    })
                    return callback(3)
                }
                return callback(0)
            })
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
}

function editMem(body, con, callback){
    try{
        query1Str = `UPDATE M SET UniID = ${body.uniNum}, FirstName = '${body.engFname}', FatherName = '${body.engFather}',`
        + `GFatherName = '${body.engGfather}', FamilyName = '${body.engLname}', AFirstName = '${body.arabFname}', AFatherName = '${body.arabFather}',`
        + `AGFatherName = '${body.arabGfather}', AFamilyName = '${body.arabLname}', Gender = '${body.gender}', PhoneNo = '${body.areaCode+body.phoneNo}',`
        + `E_mail = '${body.email}', Facebook_Link = '${body.facebook}', UniStartYear = ${body.firstYear}, MembershipStatus = '${body.memberStatus}',`
        + `LC = '${(body.localCommittee=="national")?body.newLocalCommittee:body.localCommittee}'`
        + ` WHERE UniID = ${body.memNum}`
        
        //check to see if rows exist and write queries accordingly 
        con.query(`SELECT * FROM Mt WHERE UniID = ${body.uniNum}`, function(err, results){
            if (err)
                return callback(3)
            query2Str = (results.length > 0)?`UPDATE Mt SET TStatus = '${body.trainerStatus}' WHERE UniID = ${body.uniNum}`:`INSERT INTO Mt VALUES(${body.uniNum}, 'Not Yet Assigned','Not Yet Assigned','2022-09-17','${body.trainerStatus}')`
            con.query(`SELECT * FROM MBl WHERE UniId = ${body.uniNum}`, function(err, results){
                query3Str = (results.length > 0)?`UPDATE MBl SET Status = '${body.blackListStatus}', Reason = '${body.blackListReason}' WHERE UniID = ${body.uniNum}`:`INSERT INTO MBl VALUES(${body.uniNum}, '${body.blackListStatus}','${body.blackListReason}')`
                console.log(query1Str)
                console.log(query2Str)
                console.log(query3Str)
                con.query(query1Str, function(err){
                    if (err){
                        console.log(err)
                        return callback(3)
                    }
                    con.query(query2Str, function(err){
                        if(err){
                            console.log(err)
                            return callback(3)
                        }
                        con.query(query3Str, function(err){
                            if (err){
                                console.log(err)
                                return callback(3)
                            }
                            return callback(0)
                        })
                    })
                })
            })
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }    
}


function deleteMem(memNum, con, callback){
    try{
        con.query(`DELETE FROM M WHERE UniID = ${memNum}`, function(err){
            if(err){
                console.log(err)
                return callback(3)
            }
            return callback(0)
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
}

function searchTrainer(body, con, callback){
    try{
        if (body.filterLC.toUpperCase() == "NATIONAL")
            chosenLC = ""
        else
            chosenLC = ` AND LC = '${body.filterLC}'`
        console.log(`SELECT UniID, CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) AS Name FROM M WHERE CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) LIKE '%${body.memberLike}%'` + chosenLC)
        con.query(`SELECT UniID, CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) AS Name FROM M WHERE CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) LIKE '%${body.memberLike}%'` + chosenLC, function(err, results){
            data=[]
            temp={}
            if (err){
                console.log(err)
                callback(3, data)
            }else{
                results.forEach(row => {
                    data.push({"memNum": row.UniID, "memName": row.Name})
                })
                console.log(data)
                callback(0, data)
            }
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
}

function editTrainer(body, con, callback){
    try{
        queryStr = `UPDATE Mt SET TStatus='${body.trainerStatus}',Category='${body.trainerCategory}', GradActivity='${body.trainerActivity}', GradDate='${body.gradDate}' WHERE UniID = ${body.memNum}`
        console.log(queryStr)
        con.query(queryStr, function(err){
            if (err){
                console.log(err)
                return callback(3)
            }
            return callback(0)
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
}

function editActivity(body, con, callback){
    try{
        Object.keys(body).forEach(key => {
            body[key] = body[key].replaceAll("'", "\\'")
        })

        con.query(`UPDATE A SET Aname='${body.activityName}', Adescription='${body.activityDescription}', ProposalLink='${body.proposalLink}', ReportLink='${body.reportLink}', StartDate='${body.startDate}', EndDate='${body.endDate}' WHERE ActivityID = '${body.actNum}'`, function(err){
            if (err){
                console.log(err)
                return callback(3)
            }
            getActivityCat(body.actNum, con, function(flag,cat){
                if (flag != 0){
                    console.log(err)
                    return callback(3)
                }
                if (cat == "national"){
                    con.query(`DELETE FROM NaLC WHERE ActivityID = ${body.actNum}`, function(err){
                        if (err){
                            console.log(err)
                            return callback(4)
                        }
                        if (body.localCommittee == "national"){
                            console.log( body.participatingLCs)
                            body.participatingLCs = body.participatingLCs.slice(0,-1)
                            participatingLcsArr = body.participatingLCs.split(",")
                        
                            if (participatingLcsArr.length > 0){
                                queryStr3 = "INSERT INTO NaLC VALUES"
                                participatingLcsArr.forEach(LC => {
                                    queryStr3 += `(${body.actNum}, '${LC}'),`
                                })
                            }
                            queryStr3 = queryStr3.slice(0,-1)
                            con.query(queryStr3, function(err){
                                if(err){
                                    console.log(err)
                                    return callback(5)
                                }
                                return callback(0)
                            })
                        }
                    })
                }else{
                    return callback(0)
                }   
            })

        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
}

function sendToAllParticipants (actNum, pageData, con, callback){
    try{
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user : 'pmsadb@gmail.com',
                pass : 'lpfa leqi ymoz bmvm '
            } 
        })

        var mailOptions = {
            from : 'pmsadb@gmail.com',
            to : '',
            subject : 'certificate',
            attachments : [
                {
                    filename : 'certificate.pdf',
                    path : `${__dirname}/../output.pdf`
                }
            ]

        }

        CommitteeCodes = {"GENERAL" : "TO",
                          "CB" : "CB",
                          "SCOPH" : "PH",
                          "SCOME" : "ME",
                          "SCOPE" : "PE",
                          "SCORE" : "RE",
                          "SCORP" : "RP",
                          "SCORA" : "RA"
                         }
        queryStr = `SELECT  M_A.ActivityID, M_A.UniID, M.E_mail ` +
                   `FROM M_A,M WHERE ` +
                   `M.UniID = M_A.UniID AND ` +
                   `M_A.ActivityID = ${actNum}`
                     
        con.query(queryStr, function(err, results){
            if(err){
                console.log(err)
                return callback(4)
            }
            for (const row of results){
                console.log(row)
                html2PDF(row.ActivityID, row.UniID, pageData, con, function(flag, data){
                    mailOptions.attachments = [{
                        filename : 'certificate.pdf',
                        path : `${__dirname}/../certificates/${data.certCode}_cropped.pdf`
                    }]
                    mailOptions.to = row.E_mail
                    transporter.sendMail(mailOptions, function(err){
                        if (err){
                            console.log(err)
                        }else{
                            console.log('Email sent: ' + info.response);
                        }
                    })
                })
            }
            return callback(0)
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
}

function html2PDF (actNum, memNum, pageData_original, con, callback){
    try{
        CommitteeCodes = {"GENERAL" : "TO",
                          "CB" : "CB",
                          "SCOPH" : "PH",
                          "SCOME" : "ME",
                          "SCOPE" : "PE",
                          "SCORE" : "RE",
                          "SCORP" : "RP",
                          "SCORA" : "RA"
                         }
        queryStr = `SELECT  A.Committee AS Committee, CONCAT(M.FirstName, " ",M.FatherName, " ", M.GFatherName, " ", M.FamilyName) AS Name, ` +
                   `A.Aname, DATE_FORMAT(StartDate,'%Y/%m/%d') AS StartDate1, DATE_FORMAT(EndDate,'%Y/%m/%d') AS EndDate1, ` +
                   `M_A.position AS Position, M_A.CertCode AS memNumPerA, Na.Anum AS Anum ` +
                   `FROM M, M_A, Na, A WHERE M_A.ActivityID = A.ActivityID AND `+
                   `A.ActivityID = Na.ActivityID AND `+
                   `M_A.UniID = M.UniID AND `+
                   `M.UniID = ${memNum} AND `+
                   `A.ActivityID = ${actNum}`
                     
        con.query(queryStr, function(err, results){
            if(err){
                console.log(err)
                return callback(4, pageData)
            }
            const pageData = {...pageData_original};
            
	        if (results === undefined || results.length == 0) {
		        return callback(5,pageData);
	        }
		
            certPath = __dirname + `/../views/certificates/${(results[0].Committee.toUpperCase() != 'CB')?results[0].Committee.toUpperCase():"GENERAL.ejs"}.ejs`
            pageData.participantName = results[0].Name;
            pageData.activityName = results[0].Aname;
            pageData.actStartDate = results[0].StartDate1;
            pageData.actEndDate = results[0].EndDate1;
            pageData.participentPosition = results[0].Position;
        
            date = results[0].StartDate1.split("/")
            termDate = `${Number(date[0].slice(2,4))-1}${date[0].slice(2,4)}`
        
            if (Number(date[1]) > 2)
                termDate = `${date[0].slice(2,4)}${Number(date[0].slice(2,4)) + 1}`
        
            pageData.certCode = `PS${CommitteeCodes[results[0].Committee.toUpperCase()]}${termDate}${String(results[0].Anum).padStart(2,'0')}${String(results[0].memNumPerA).padStart(4,'0')}`
            pageData.participentPosition = results[0].Position
        
            
            ejs.renderFile(certPath, pageData, function(err, htmlFile){
                if(err){
                    console.log(err)
                    return callback(3, pageData)
                }
                i = 0;
                (async () => {
                    i++;
                    // Create a browser instance
                    const browser = await puppeteer.launch({
                      headless : "new",
                      ignoreDefaultArgs: ['--disable-extensions']
                    });
                
                    // Create a new page
                    const page = await browser.newPage();
                
                    await page.setDefaultNavigationTimeout(0); 
                
                    regex = /public\/images\/.*\.png/g
                
                    htmlFile.match(regex).forEach(match => {
                      htmlFile = htmlFile.replace('"\.\.\/\.\.\/' + match + '"', `"data:image/png;base64,${fs.readFileSync(match).toString('base64')}"`)
                    })
                    
                    htmlFile = htmlFile.replace("src: url('../../public/fonts/malibu-ring.ttf')", `src: url("data:font/ttf;base64,${fs.readFileSync("public/fonts/malibu-ring.ttf").toString("base64")}");`)
                
                    await page.setContent(htmlFile, { waitUntil: 'networkidle0' });
                
                    // To reflect CSS used for screens instead of print
                    await page.emulateMediaType('screen');
                
                    // Downlaod the PDF
                    const pdfOption = await page.pdf({
                      path: `certificates/${pageData.certCode}.pdf`,
                      printBackground: true,
                      height: "2315px",
                      width : "1591px"
                    });
                
                    // Close the browser instance
                    await browser.close();
                
                    child = await subProcess.execSync(`pdfcrop --margins '0 0 0 -10' certificates/${pageData.certCode}.pdf certificates/${pageData.certCode}_cropped.pdf`)
                
                    callback(0, pageData)
                
                })();
            
            
                return
            })
        })
    }catch(e){
        console.log(e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'Error : ' + e)
        fs.writeFileSync( __dirname + '/../logs/error.txt', 'req.body = ' + req.body)
        fs.writeFileSync( __dirname + '/../logs/error.txt', '-------------------------------------------------------------------------------')
        return callback(3)
    }
}





module.exports = {
    mainPageInformer,
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
    sendToAllParticipants
}
