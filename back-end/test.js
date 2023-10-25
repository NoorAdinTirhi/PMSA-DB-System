const puppeteer = require('puppeteer');
const fs = require('fs');


// let htmlFile = fs.readFileSync("public/index.html").toString()
// regex2 = /public\/images\/.*\.png/g
// console.log(fs.readFileSync('public/images/Medal_thing.png').toString('base64'))

// `src=data:image/jpeg;base64,${readFileSync('1.jpg').toString('base64')}` 


// htmlFile.match(regex).forEach(match => {
    
// })



(async () => {

  // Create a browser instance
  const browser = await puppeteer.launch({
    headless : "new"
  });

  // Create a new page
  const page = await browser.newPage();

  //Get HTML content from HTML file
  let htmlFile = fs.readFileSync('views/certificates/index.html').toString();

  regex = /public\/images\/.*\.png/g

  htmlFile.match(regex).forEach(match => {
    htmlFile = htmlFile.replace('"\.\.\/\.\.\/' + match + '"', `"data:image/png;base64,${fs.readFileSync(match).toString('base64')}"`)
  })
  
  htmlFile = htmlFile.replace("src: url('../../public/fonts/malibu-ring.ttf')", `src: url("data:font/ttf;base64,${fs.readFileSync("public/fonts/malibu-ring.ttf").toString("base64")}");`)
  
  await page.setContent(htmlFile, { waitUntil: 'networkidle0' });

  // To reflect CSS used for screens instead of print
  await page.emulateMediaType('screen');

  fs.writeFileSync("test.html", htmlFile)
  // Downlaod the PDF
  const pdfOption = await page.pdf({
    path: 'result.pdf',
    printBackground: true,
    height: "2315px",
    width : "1591px"
  });
   
  // Close the browser instance
  await browser.close();
})();
