const { query } = require("express")

// query the DB to get required information for the mainpage
function mainPageInformer(username, con, pageData, callback) {
    con.query(`SELECT *, DATE_FORMAT(StartDate,'%d/%m/%Y') AS StartDate1, DATE_FORMAT(LastActionTime,'%d/%m/%Y') AS LastActionTime1 FROM Users;`, function(err, results) {
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
}

//function for reseting LC
function resetLC(LC, con, callback) {
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
}

function updateAction(username, action, con, callback) {
    console.log(username, action)
    con.query(`UPDATE Users  SET LastAction = '${action}' where Username = '${username}'`, function(err, results) {
        if (err) {
            console.log(err)
            return callback(3);
        } else {
            return callback(0);
        }
    })
}
function updateLCStartTerm(username, con, callback){
    const current_time = new Date();
    con.query(`UPDATE Users SET StartDate = '${current_time.getFullYear()}-${current_time.getMonth()+1}-${current_time.getDay()+1}' WHERE Username = '${username}'`, function(err){
        if (err){
            console.log(err)
            return callback(1)
        }else{
            return callback(0)
        }
    })
}

function blackListInformer(username, pageData, con, callback){
    con.query(`SELECT CONCAT(M.FirstName, M.FatherName, M.GFatherName, M.FamilyName) AS Name, MBl.Status, MBl.Reason  FROM MBl, M WHERE M.UniID = MBl.UniID`, function(err, results){
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
}
    


function allMembersInformer(username, number, direciton, pageData, LC, excplicitLC, con, callback) {
    data = ""
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
}

function allTrainersInformer(username, number, pageData, LC, con, callback) {
    data = ""
    if (LC.toUpperCase() == "NATIONAL")
        chosenLC = ""
    else
        chosenLC = ` AND LC = '${LC}'`
    console.log(`SELECT * FROM M, Mt WHERE M.UniID = Mt.UniID and M.UniID > ${number}` + chosenLC + " ORDER BY M.UniID LIMIT 1")
    con.query(`SELECT *, DATE_FORMAT(GradDate,'%d/%m/%Y') AS GradDate1 FROM M, Mt WHERE M.UniID = Mt.UniID and M.UniID > ${number}` + chosenLC + " ORDER BY M.UniID LIMIT 1", function(err, results) {
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
            if (results.length > 0) {
                getUserInfo(username, con, function(userData, err) {
                    console.log(results[0])
                    pageData.user = userData.user
                    pageData.position = userData.position
                    pageData.userLC = userData.LC
                    pageData.cipher = userData.cipher
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
                    pageData.trainerCategory = results[0].Category
                    pageData.gradActivity = results[0].GradActivity
                    pageData.gradDate = results[0].GradDate1

                    checkTrainerStatus(results[0].UniID, con, function(flag, trainerStatus) {
                        if (flag == 0) {
                            pageData.trainerStatus = trainerStatus
                            checkBlackListStatus(results[0].UniID, con, function(flag, blStatus, blReason) {
                                if (flag == 0) {
                                    pageData.blacklistStatus = blStatus
                                    pageData.blacklistReason = blReason
                                    console.log(pageData)
                                    return callback(flag, pageData)
                                } else
                                    return callback(flag, pageData)
                            })
                        } else
                            return callback(flag, pageData)
                    })


                })

            } else {

                Object.keys(pageData).forEach(key => {
                    temp = pageData[key]
                    if (typeof temp == "string")
                        pageData[key] = "no Members"
                    else
                        pageData[key] = [];
                })
                getUserInfo(username, con, function(userData, err) {
                    pageData.user = userData.user
                    pageData.position = userData.position
                    pageData.userLC = userData.LC;
                    pageData.cipher = userData.cipher
                    return callback(0, pageData)
                })
            }
        }
    })
}


function allActivitiesInformer(username, pageData, LC, curFilter,con, callback) {
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
    console.log(pageData.filter)
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
}
//useful function getting current user's info
function getUserInfo(username, con, callback) {
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
}

function getMemberActivityInfo(memNum, activityID, con, callback) {
    con.query(`SELECT *, CONCAT(M.FirstName, M.FatherName, M.GFatherName, M.FamilyName) AS Name FROM M_A, M WHERE M_A.ActivityID = ${activityID} AND M.UniID > ${memNum} ORDER BY M.UniID LIMIT 1`, function(err, results) {
        data = results[0]
        if (err) {
            //error in query
            console.log(err)
            return callback(1, data)
        } else {
            if (results.length > 0) {
                data.trainerCategory = results[0].Category
                data.gradActivity = results[0].GradActivity;
                data.gradDate = results[0].GradDate1
                return callback(0, data)
            }else{
                return callback(2, data)
            }
        }
    })
}


function getTrainerInfo(memNum, con, callback) {
    con.query(`SELECT * , DATE_FORMAT(GradDate,'%d/%m/%Y') AS GradDate1 FROM MT WHERE UniID = ${memNum}`, function(err, results) {
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
}

function checkBlackListStatus(uniNum, con, callback) {
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
}

function getNationalActivites(uniNum, con, callback) {
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
}

function getLocalActivites(uniNum, con, callback) {
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
}

function localActivityInformer(username, memNum, ActivityID, pageData, con, callback) {
    con.query(`SELECT *, DATE_FORMAT(StartDate,'%d/%m/%Y') AS StartDate1, DATE_FORMAT(EndDate,'%d/%m/%Y') AS EndDate1 FROM A,La WHERE A.ActivityID >= '${ActivityID}' AND A.ActivityID = La.ActivityID ORDER BY A.ActivityID LIMIT 1`, function(err, results){
        if (err){
            console.log(err)
            return callback(3, pageData)
        }else{
            console.log(results)
            getUserInfo(username, con, function(userData, flag){
                if (flag != 0){
                    return callback(1, pageData)
                }else{
                    pageData.user = userData.user
                    pageData.position = userData.position
                    pageData.userLC = userData.LC
                    pageData.cipher = userData.cipher
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
                        getMemberActivityInfo(memNum, ActivityID, con, function(flag, memData){
                            console.log("before getMemberActivityInfo " + flag)
                            if (flag != 0){
                                if (flag == 2){
                                    Object.keys(pageData).forEach(key => {
                                        if ((typeof pageData[key] != "object") && ((pageData[key] == null || pageData[key] == undefined || pageData[key] == ""))){
                                            pageData[key] = "unassigned"
                                        }
                                    }) 
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
                                console.log("before getNationalActivites")
                                
                                getNationalActivites(memData.UniId, con, function(flag, NAdata){
                                    if (flag != 0){
                                        return callback(4, pageData)
                                    }else{
                                        
                                        NAdata.forEach(element => {
                                            pageData.nationalActivites.push(element.Aname)
                                        })
                                        console.log("before getLocalActivites")
                                        getLocalActivites(memData.UniID, con, function(flag, LAdata){
                                            if (flag != 0){
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
}

function nationalActivityInformer(username, memNum, ActivityID, pageData, con, callback) {
    con.query(`SELECT *, DATE_FORMAT(StartDate,'%d/%m/%Y') AS StartDate1, DATE_FORMAT(EndDate,'%d/%m/%Y') AS EndDate1 FROM A WHERE ActivityID >= '${ActivityID}' ORDER BY ActivityID LIMIT 1`, function(err, results){
        if (err){
            console.log(err)
            return callback(3, pageData)
        }else{
            getUserInfo(username, con, function(userData, flag){
                if (flag != 0){
                    return callback(1, pageData)
                }else{
                    pageData.user = userData.user
                    pageData.position = userData.position
                    pageData.userLC = userData.LC
                    pageData.cipher = userData.cipher
                    console.log(results.length)
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
                                console.log(data)
                                data.forEach(row =>{
                                    sum += row.totalLCPart
                                })
                                data.forEach(row => {
                                pageData[`${row.LC}Percent`] =`${Math.round((row.totalLCPart/sum)*100)}%`
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
                                        getMemberActivityInfo(memNum, ActivityID, con, function(flag, memData){
                                            console.log("before getMemberActivityInfo " + flag)
                                            if (flag != 0){
                                                if (flag == 2){
                                                    Object.keys(pageData).forEach(key => {
                                                        if ((typeof pageData[key] != "object") && ((pageData[key] == null || pageData[key] == undefined || pageData[key] == ""))){
                                                            pageData[key] = "unassigned"
                                                        }
                                                    }) 
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
                                                console.log("before getNationalActivites")

                                                getNationalActivites(memData.UniId, con, function(flag, NAdata){
                                                    if (flag != 0){
                                                        return callback(4, pageData)
                                                    }else{

                                                        NAdata.forEach(element => {
                                                            pageData.nationalActivites.push(element.Aname)
                                                        })
                                                        console.log("before getLocalActivites")
                                                        getLocalActivites(memData.UniID, con, function(flag, LAdata){
                                                            if (flag != 0){
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
}


function getLCParticipation(con, callback){
    con.query(`SELECT tbl.LC, SUM(tbl.LCPart) AS totalLCPart FROM 
               (SELECT LC, COUNT(*)  AS LCPart FROM La GROUP BY LC
               UNION
               SELECT LC, COUNT(*) AS LCPart FROM NaLC GROUP BY LC) tbl
               GROUP BY LC; `, function(err, results){
                data = [];
                if (err){
                    console.log(err)
                    return callback (3, data)
                }else{
                    return callback(0, results)
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
    participatingLcsArr = [];
    if (localCommittee == "national"){
        body.participatingLCs = body.participatingLCs.slice(0,-1)
        participatingLcsArr = body.participatingLCs.split(",")
        queryStr1 = `INSERT INTO A ( Aname, Committee, Adescription, ProposalLink, ReportLink, StartDate, EndDate) VALUES ('${body.activityName}', '${body.committee}', '${body.activityDescription}', '${body.proposalLink}', '${body.reportLink}', '${body.startDate}', '${body.endDate}');`       
        queryStr2 = `INSERT INTO Na VALUES (LAST_INSERT_ID())`;
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
    addActivity
}