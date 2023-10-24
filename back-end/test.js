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
  const browser = await puppeteer.launch();

  // Create a new page
  const page = await browser.newPage();

  //Get HTML content from HTML file
  let htmlFile = fs.readFileSync('views/certificates/index.html').toString();

  regex = /public\/images\/.*\.png/g

  htmlFile.match(regex).forEach(match => {
    htmlFile = htmlFile.replace('"\.\.\/\.\.\/' + match + '"', `"data:image/png;base64,${fs.readFileSync(match).toString('base64')}"`)
})
   htmlFile = htmlFile.replace("src: url('../../public/fonts/malibu-ring.ttf')", `src : (data:font/truetype;charset=utf-8;base64,"${fs.readFileSync('public/fonts/malibu-ring.ttf').toString('base64')})"`)

  await page.setContent(htmlFile, { waitUntil: 'domcontentloaded' });

  // To reflect CSS used for screens instead of print
  await page.emulateMediaType('screen');

  // Downlaod the PDF
  const pdf = await page.pdf({
    path: 'result.pdf',
    printBackground: true,
    format: 'A2',
  });

  // Close the browser instance
  await browser.close();
})();

// let ttf = fs.readFileSync('public/fonts/malibu-ring.ttf').toString('base64');
// console.log(ttf)