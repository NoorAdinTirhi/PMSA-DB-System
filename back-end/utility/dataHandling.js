
// query the DB to get required information for the mainpage
function mainPageInformer(username, con,  pageData, callback){
    con.query(`SELECT *, DATE_FORMAT(StartDate,'%d/%m/%Y') AS StartDate1, DATE_FORMAT(LastActionTime,'%d/%m/%Y') AS LastActionTime1 FROM Users;`, function(err, results){
        getUserInfo(username, con, function(userData, errorStatus){
            if (errorStatus == 0){
                Object.keys(pageData).forEach(key => {
                    pageData[key] = "unassigned"
                })
                pageData.user = userData.user
                pageData.position = userData.position
                pageData.userLC = userData.LC;
                pageData.cipher = userData.cipher
                // console.log(results)
                results.forEach(row =>{
                    varNameStartDate = `${row.Locality}StartDate`

                    pageData[varNameStartDate] = row.StartDate;
                    pageData.usersLog = [];

                    pageData.usersLog.push({ "position" : `${row.Locality.toUpperCase()} ${row.Position}`,
                                                "lastLogDate" : (row.LastActionTime1)?row.LastActionTime1:"unassigned",
                                                "lastChange" : (row.LastAction1)?row.LastAction1:"unassigned"})
                    
                    if (row.StartDate == null)
                        pageData[varNameStartDate] = "unassigned"
                })        
                return callback(pageData)
            } else{

            } 
        })
    })
}

//function for reseting LC
function resetLC(LC, con, callback){
    if (LC.toUpperCase() == "NATIONAL")
        return callback(5)
    con.query(`UPDATE M  SET MembershipStatus = 'Inactive' where LC = '${LC}'`, function(err, reuslts){
        if (err){
            console.log(err)
            return callback(3);
        } else{
            return callback(0);
        }
    })
}

function allMembersInformer(username, number, pageData,LC, con, callback){
    data = ""
    if (LC.toUpperCase() == "NATIONAL")
        chosenLC = ""
    else
        chosenLC = ` AND LC = '${LC}'`
    con.query(`SELECT * FROM M WHERE UniID > ${number}` + chosenLC + " ORDER BY UniID LIMIT 1", function(err, results){
        if (err){
            console.log(err)
            return callback(3, data);
        } else{
            Object.keys(pageData).forEach(key => {
                    temp = pageData[key]
                    if (typeof temp == "string")
                        pageData[key] = "no Members"
                    else
                        pageData[key] = [];
                })
            if (results.length > 0){
                getUserInfo(username, con, function(userData, err){
                    pageData.user               = userData.user
                    pageData.position           = userData.position
                    pageData.userLC             = userData.LC
                    pageData.cipher             = userData.cipher
                    pageData.engFname           = results[0].FirstName
                    pageData.engFather          = results[0].FatherName
                    pageData.engGfather         = results[0].GFatherName
                    pageData.engLname           = results[0].FamilyName
                    pageData.arabFname          = results[0].AFirstName  
                    pageData.arabFather         = results[0].AFatherName 
                    pageData.arabGfather        = results[0].AGFatherName
                    pageData.arabLname          = results[0].AFamilyName 
                    pageData.areaCode           = results[0].PhoneNo.slice(0,3)
                    pageData.phoneNo            = results[0].PhoneNo.slice(3)
                    pageData.email              = results[0].E_mail
                    pageData.firstYear          = results[0].UniStartYear
                    pageData.facebook           = results[0].Facebook_Link
                    pageData.uniNum             = results[0].UniID
                    pageData.localCommittee     = results[0].LC
                    pageData.memStatus          = results[0].MembershipStatus
                    pageData.curMemNumber       = results[0].UniID

                    checkTrainerStatus(results[0].UniID, con, function(flag, trainerStatus) {
                        if (flag == 0){
                            pageData.trainerStatus  = trainerStatus
                            checkBlackListStatus(results[0].UniID, con, function(flag, blStatus, blReason) {
                                if (flag == 0){
                                    pageData.blacklistStatus  = blStatus
                                    pageData.blacklistReason = blReason
                                    getNationalActivites(results[0].UniID,con, function(flag, natActivities){
                                        if (flag == 0){
                                            pageData.nationalActivities = []
                                            natActivities.forEach(row =>{
                                                pageData.nationalActivities.push(row.Aname)
                                            })
                                            getLocalActivites(results[0].UniID,con, function (flag, localActivities){
                                                if (flag == 0){
                                                    pageData.localActivities = [];
                                                    localActivities.forEach(row => {
                                                        pageData.localActivities.push(row.Aname)
                                                    })
                                                    return callback(flag, pageData)
                                                }else{
                                                    return callback(flag, pageData)
                                                }
                                            })
                                        } else{
                                            return callback(flag, pageData)
                                        }
                                    })
                                }else
                                    return callback(flag, pageData)
                        })    
                        }else
                            return callback(flag, pageData)
                    })

                    
                })
                
                //TODO COMPLETE QUERY TO GET national activities 
                //TODO COMPLETE QUERY TO GET local activities

            } else {

                Object.keys(pageData).forEach(key => {
                    temp = pageData[key]
                    if (typeof temp == "string")
                        pageData[key] = "no Members"
                    else
                        pageData[key] = [];
                })
                getUserInfo(username, con, function(userData, err){
                    pageData.user               = userData.user
                    pageData.position           = userData.position
                    pageData.userLC             = userData.LC;
                    pageData.cipher             = userData.cipher
                    return callback(0, pageData)
                })
            }
        }
    } )
}
function allTrainersInformer(username, number, pageData,LC, con, callback){
    data = ""
    if (LC.toUpperCase() == "NATIONAL")
        chosenLC = ""
    else
        chosenLC = ` AND LC = '${LC}'`
    console.log(`SELECT * FROM M, Mt WHERE M.UniID = Mt.UniID and M.UniID > ${number}` + chosenLC + " ORDER BY M.UniID LIMIT 1")
    con.query(`SELECT *, DATE_FORMAT(GradDate,'%d/%m/%Y') AS GradDate1 FROM M, Mt WHERE M.UniID = Mt.UniID and M.UniID > ${number}` + chosenLC + " ORDER BY M.UniID LIMIT 1", function(err, results){
        if (err){
            console.log(err)
            return callback(3, data);
        } else{
            Object.keys(pageData).forEach(key => {
                    temp = pageData[key]
                    if (typeof temp == "string")
                        pageData[key] = "no Members"
                    else
                        pageData[key] = [];
                })
            if (results.length > 0){
                getUserInfo(username, con, function(userData, err){
                    console.log(results[0])
                    pageData.user               = userData.user
                    pageData.position           = userData.position
                    pageData.userLC             = userData.LC
                    pageData.cipher             = userData.cipher
                    pageData.engFname           = results[0].FirstName
                    pageData.engFather          = results[0].FatherName
                    pageData.engGfather         = results[0].GFatherName
                    pageData.engLname           = results[0].FamilyName
                    pageData.arabFname          = results[0].AFirstName  
                    pageData.arabFather         = results[0].AFatherName 
                    pageData.arabGfather        = results[0].AGFatherName
                    pageData.arabLname          = results[0].AFamilyName 
                    pageData.areaCode           = results[0].PhoneNo.slice(0,3)
                    pageData.phoneNo            = results[0].PhoneNo.slice(3)
                    pageData.email              = results[0].E_mail
                    pageData.firstYear          = results[0].UniStartYear
                    pageData.facebook           = results[0].Facebook_Link
                    pageData.uniNum             = results[0].UniID
                    pageData.localCommittee     = results[0].LC
                    pageData.memStatus          = results[0].MembershipStatus
                    pageData.curMemNumber       = results[0].UniID
                    pageData.trainerCategory    = results[0].Category
                    pageData.gradActivity       = results[0].GradActivity     
                    pageData.gradDate           = results[0].GradDate1      

                    checkTrainerStatus(results[0].UniID, con, function(flag, trainerStatus) {
                        if (flag == 0){
                            pageData.trainerStatus  = trainerStatus
                            checkBlackListStatus(results[0].UniID, con, function(flag, blStatus, blReason) {
                                if (flag == 0){
                                    pageData.blacklistStatus  = blStatus
                                    pageData.blacklistReason = blReason
                                    console.log(pageData)
                                    return callback(flag, pageData)
                                }else
                                    return callback(flag, pageData)
                        })    
                        }else
                            return callback(flag, pageData)
                    })

                    
                })
                
                //TODO COMPLETE QUERY TO GET national activities 
                //TODO COMPLETE QUERY TO GET local activities

            } else {

                Object.keys(pageData).forEach(key => {
                    temp = pageData[key]
                    if (typeof temp == "string")
                        pageData[key] = "no Members"
                    else
                        pageData[key] = [];
                })
                getUserInfo(username, con, function(userData, err){
                    pageData.user               = userData.user
                    pageData.position           = userData.position
                    pageData.userLC             = userData.LC;
                    pageData.cipher             = userData.cipher
                    return callback(0, pageData)
                })
            }
        }
    } )
}

function allActivitiesInformer(username, pageData, LC, con, callback){
    data = ""
    if (LC.toUpperCase() == "NATIONAL"){
        secondTable = "Na"
        chosenLC = ""
        nat = true
    }else{
        secondTable = "La"
        chosenLC = ` WHERE LC = '${LC}'`
        nat = false
    }
    console.log(`SELECT A.Aname, A.ActivityID, A.Committee FROM A${ ", " + secondTable} WHERE ${secondTable}.ActivityID = A.ActivityID ${(nat)?(""):("AND " + "La.LC = " + LC.toLowerCase())}`)
    con.query(`SELECT A.Aname, A.ActivityID, A.Committee FROM A${ ", " + secondTable} WHERE ${secondTable}.ActivityID = A.ActivityID ${(nat)?(""):("AND " + "La.LC = " + LC.toLowerCase())}`, function(err, results){
        if (err){
            console.log(err)
            callback(3, pageData)
        }else{
            getUserInfo(username, con, function(userData, err){
                console.log(err)
                pageData.user               = userData.user
                pageData.position           = userData.position
                pageData.userLC             = userData.LC
                pageData.cipher             = userData.cipher
                pageData.allActivities      = []
                results.forEach(row => {
                temp = {actID : row.ActivityID, committee: row.Committee.toLowerCase(), actName: Aname}
                pageData.allActivities.push(temp)
            })
            return callback(0, pageData)
            })
   
        }
    })
}
//useful function getting current user's info
function getUserInfo(username, con, callback){
    con.query(`SELECT * FROM Users WHERE Username = "${username}"`, function(err, results){
        data = {"user":"","LC":"","position":"", "cipher":""}
        if(err){
            //error in query
            return callback (data,1)
        } else{
            if (results.length > 0){
                data.user = username;
                data.LC = results[0].Locality;
                data.position = results[0].Position
                data.cipher = results[0].Hmac
                return callback(data,0)
            } else{
                //error in data
                return callback(data,2)
            }
        }
    })
}
function getTrainerInfo(memNum,  con, callback){
    con.query(`SELECT * , DATE_FORMAT(GradDate,'%d/%m/%Y') AS GradDate1 FROM MT WHERE UniID = ${memNum}`, function(err, results){
        data = {"user":"","LC":"","position":"", "cipher":""}
        if(err){
            //error in query
            return callback (1,data)
        } else{
            if (results.length > 0){
                data.trainerCategory    = results[0].Category
                data.gradActivity       = results[0].GradActivity;
                data.gradDate           = results[0].GradDate1
                return callback(0,data)
            } else{
                //error in data
                return callback(2,data)
            }
        }
    })
}
function checkTrainerStatus(uniNum, con, callback){
    con.query(`SELECT * FROM M, Mt WHERE M.UniID = Mt.UniID AND M.UniID = ${uniNum}`, function(err, trainerResults){
        if (err){
            console.log(err)
            return callback(3,"")
        }else{
            if (trainerResults.length == 0){
                callback(0,"Inactive")
            }else{
                callback(0,trainerResults[0].TStatus)
            }
        }
    })
}

function checkBlackListStatus(uniNum, con, callback){
    con.query(`SELECT * FROM M,MBl where M.UniID = MBl.UniID AND M.UniID = ${uniNum}`, function(err, blackListResults){
        if (err){
            console.log(err)
            return callback(3,"")
        }else{
            if (blackListResults.length == 0){
                callback(0,"clear")
            }else{
                callback(0,blackListResults[0].Status, blackListResults[0].Reason)
            }
        }
    })
}

function getNationalActivites(uniNum,con,callback){
    con.query(`SELECT A.Aname, A.ActivityID, A.Committee FROM M_A, A WHERE M_A.ActivityID = A.ActivityID AND UniID = ${uniNum} AND A.ActivityID IN (SELECT Na.ActivityID FROM Na)`, function(err, results){
        if (err){
            console.log(err)
            return callback(3, results)
        }else{
            if (results > 0){
                return callback(0, results)
            } else{
                return callback(1, results)
            }   
        }
    })
}
function getLocalActivites(uniNum,con,callback){
    con.query(`SELECT A.Aname, A.ActivityID, A.Committee FROM M_A, A WHERE M_A.ActivityID = A.ActivityID AND UniID = ${uniNum} AND A.ActivityID IN (SELECT La.ActivityID FROM La)`, function(err, results){
        if (err){
            console.log(err)
            return callback(3, results)
        }else{
            if (results > 0){
                return callback(0, results)
            } else{
                return callback(1, results)
            }   
        }
    })
}


  


module.exports = {
    mainPageInformer,
    resetLC,
    allMembersInformer,
    allActivitiesInformer,
    allTrainersInformer
}