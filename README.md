# PMSA-DB-System
A MySQL DB used to keep track and update the PMSA activities, the commitees holding them as well as the involved members.

for the front-end, Javascript, HTML and CSS are used.

for the back-end, NodeJS with a MYSQL Connector are used.


## Dependencies :

we'll need to install MySQL, NodeJS and npm

```sh
$ sudo ap update && sudo apt upgrade
$ sudo apt install mysql nodejs npm 
```

to print certificates we use puppeteer to covert html-pdf and pdfcrop to prepare pdf, make sure to install puppeteer dependencies.

```sh
$ sudo apt install libx11-xcb1 libxcomposite1 libasound2-dev libatk1.0-0 libatk-bridge2.0-0 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 libgtk-3-dev libnotify-dev libnss3 libxss1
```
puppeteer also uses chromium
```sh
$ sudo apt-get install chromium-browser
```

finally, our program also pdfcrop which is included in texlive-extra-utils
```sh
$ sudo apt-get install texlive-extra-utils
```

## Setup
after cloning repo, you will need to install the nodejs packages
```sh
$ npm update
$ cd back-end
$ npm update
```

now, run :
```sh
$ npm audit
```

if there are vurnablities, run :
```sh
$ npm audit fix
```
use the -f argument if this doesn't work.
(you might need to run this more than once)



