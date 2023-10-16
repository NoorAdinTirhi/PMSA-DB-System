function allTrainersInformer(username, number, direciton, pageData, LC, excplicitLC, con, callback) {
    data = ""
    console.log(excplicitLC)
    if (excplicitLC.toUpperCase() == "NATIONAL")
        chosenLC = ""
    else
        chosenLC = ` AND LC = '${excplicitLC}'`

    console.log(`SELECT *, DATE_FORMAT(GradDate,'%d/%m/%Y') AS GradDate1 FROM M, Mt WHERE M.UniID = Mt.UniID and M.UniID ${(direciton == "next")?">":"<"} ${number}` + chosenLC + " ORDER BY M.UniID LIMIT 1")
    con.query(`SELECT *, DATE_FORMAT(GradDate,'%d/%m/%Y') AS GradDate1 FROM M, Mt WHERE M.UniID = Mt.UniID and M.UniID ${(direciton == "next")?">":"<"} ${number}` + chosenLC + " ORDER BY M.UniID LIMIT 1", function(err, results) {
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
                    pageData.pageData.trainerStatus = results[0].TStatus

                    checkBlackListStatus(results[0].UniID, con, function(flag, blStatus, blReason) {
                        if (flag == 0) {
                            pageData.blacklistStatus = blStatus
                            pageData.blacklistReason = blReason
                            console.log(pageData)
                            return callback(flag, pageData)
                        } else
                            return callback(flag, pageData)
                    })
                }else{
                                
                    console.log(`SELECT *, DATE_FORMAT(GradDate,'%d/%m/%Y') AS GradDate1 FROM M, Mt WHERE M.UniID = Mt.UniID and M.UniID ${(direciton == "next")?">":"<"} ${number} ${(direciton == "next")?"0":"2147483646"}` + chosenLC + ` ORDER BY UniID ${(direciton=="next")?"":"DESC"} LIMIT 1`)
                    con.query(`SELECT *, DATE_FORMAT(GradDate,'%d/%m/%Y') AS GradDate1 FROM M, Mt WHERE M.UniID = Mt.UniID and M.UniID ${(direciton == "next")?">":"<"} ${number} ${(direciton == "next")?"0":"2147483646"}` + chosenLC + ` ORDER BY UniID ${(direciton=="next")?"":"DESC"} LIMIT 1`, function(err, results) {
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
                            pageData.trainerCategory = results[0].Category
                            pageData.gradActivity = results[0].GradActivity
                            pageData.gradDate = results[0].GradDate1
                            pageData.pageData.trainerStatus = results[0].TStatus
                                
                            checkBlackListStatus(results[0].UniID, con, function(flag, blStatus, blReason) {
                                if (flag == 0) {
                                    pageData.blacklistStatus = blStatus
                                    pageData.blacklistReason = blReason
                                    console.log(pageData)
                                    return callback(flag, pageData)
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
