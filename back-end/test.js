
const pdf = require('html-pdf')
const path = require('path')
const ejs = require('ejs')
const url = require('url')



 const options = { format: 'A4', path: 'output.pdf', base: 'file://' + __dirname + './public' }

ejs.renderFile("views/certificates/SCORE.ejs", {participantName:"noor", activityName:"noorification", actStartDate:"17-09-2023", actEndDate:"17-10-2023", participentPosition: "organizer", certCode: "A4F412F"}, function(err,data){
        if (err){
            res.send(err)
            console.log(err)
        }else{
            let options = {
                height : "1735px",
                width  : "1180px",
                base   : 'file://' + __dirname + "\\public"
            }
            console.log(options.base)
            pdf.create(data, options).toFile("report.pdf", function(err,data){
                if (err){
                    res.send(err)
                    console.log(err)
                }else{
                    // console.log(data)
                }
            })
        }
    })

