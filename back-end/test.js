var nodemailer = require('nodemailer');

transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user : 'pmsadb@gmail.com',
      pass : 'lpfa leqi ymoz bmvm '
  } 
})

var mailOptions = {
  from : 'pmsadb@gmail.com',
  to : 'nooradintirhi@gmail.com',
  subject : 'certificate',
  text: "test"
}

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
}); 
