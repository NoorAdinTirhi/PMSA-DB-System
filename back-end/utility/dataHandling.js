
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
//function for reseting LC
function resetLC(LC, con, callback){
    con.query(`UPDATE M  SET MembershipStatus = 'Inactive' where LC = '${LC}'`, function(err, reuslts){
        if (err){
            console.log(err)
            return callback(3);
        } else{
            return callback(0);
        }
    })
}

function allMembersInformer(pageData,LC, con, callback){
    data = ""
    if (LC == "national")
        chosenLC = ""
    else
        chosenLC = ` WHERE LC = '${LC}'`

    con.query("SELECT * FROM M" + chosenLC + " LIMIT 1", function(err, results){
        if (err){
            console.log(err)
            return callback(3, data);
        } else{
            if (results.length > 0){
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
                pageData.firstYear          = results[0].Facebook_Link
                pageData.uniNum             = results[0].UniID
                pageData.localCommittee     = results[0].LC
                pageData.memStatus          = results[0].MembershipStatus

                checkTrainerStatus(results[0].UniID, function(flag, trainerStatus) {
                    if (flag == 0)
                        pageData.trainerStatus  = trainerStatus
                    else
                        callback(flag, pageData)
                })

                checkBlackListStatus(results[0].UniID, function(flag, blStatus) {
                    if (flag == 0)
                        pageData.blacklistStatus  = pageData
                    else
                        callback(flag, pageData)
                })    
                //TODO COMPLETE QUERY TO GET national activities 
                //TODO COMPLETE QUERY TO GET local activities

            } else {
                Object.keys(pageData).forEach(key => {
                    pageData[key] = "no Members"
                })
            }
            return callback(0, pageData);
        }
    } )
}

function checkTrainerStatus(uniNum, callback){
    con.query(`SELECT * FROM M Mt where M.UniID = Mt.UniID AND M.UniID = ${uniNum}`, function(err, results){
        if (err){
            console.log(err)
            return callback(3,"")
        }else{
            if (trainerResults.length != 0){
                callback(0,"Inactive")
            }else{
                callback(0,results[0].TStatus)
            }
        }
    })
}

function checkBlackListStatus(uniNum, callback){
    con.query(`SELECT * FROM M MBl where M.UniID = MBl.UniID AND M.UniID = ${uniNum}`, function(err, results){
        if (err){
            console.log(err)
            return callback(3,"")
        }else{
            if (trainerResults.length != 0){
                callback(0,"clear")
            }else{
                callback(0,results[0].Status)
            }
        }
    })
}

function getNationalActivites(uniNum,callback){
    con.query(`SELECT * FROM M A M_A `)
}





module.exports = {
    mainPageInformer,
    resetLC,
    allMembersInformer
}