
function mainPageInformer(username, con,  pageData, callback){
    con.query(`SELECT * FROM Users`, function(err, results){
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
                    varNameLTG = `${(row.Locality == "National") ? "nat" : row.Locality}${row.Position}LTG`
                    varNameLC = `${(row.Locality == "National") ? "nat" : row.Locality}${row.Position}LTC`
                    pageData[varNameLTG] = row.LastActionTime;
                    pageData[varNameLC] = row.LastChange
                    if (row.LastAction == null)
                        pageData[varNameLC] = "unassigned"
                    if (row.LastActionTime == null)
                        pageData[varNameLTG] = "unassigned"
                })        
                return callback(pageData)
            } else{

            } 
        })
    })
}
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



module.exports = {
    mainPageInformer
}