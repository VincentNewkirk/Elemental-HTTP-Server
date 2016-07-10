const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
let elementCounter = 2;

const server = http.createServer((req, res) =>  {
  if(req.method === 'GET'){
    getFunction(req, res);
  } else if(req.method === 'POST'){
    postFunction(req, res);
  }
});

server.listen('8080');

const getFunction = (req, res) => {
  if(req.url === '/'){
    req.url = '/index.html';
  }
  fs.readFile('public' + req.url, (err, data) => {
    if(err !== null){
      res.write(fs.readFileSync('public/404.html'));
      res.end();
    } else {
      res.write(fs.readFileSync('public' + req.url));
      res.end();
    }
  });
};


const postFunction = (req, res) => {
  req.on('data', (data) => {
    const reqBody = querystring.parse(data.toString());
    fs.writeFile('public' + req.url, htmlTemplate(reqBody));
    updateIndexHtml(req, reqBody);
    res.end();
  });
};

const updateIndexHtml = ( req, reqBody ) =>{
  fs.readFile('public/index.html', (err, data)=>{
    let indexHtmlString = data.toString();
    indexHtmlString = indexHtmlString.replace('</ol>',
    `  <li>
      <a href="${req.url}">${reqBody.elementName}</a>
    </li>
    </ol>`);
    let findTheNum = indexHtmlString.indexOf(`</h3>`);
    let numOfElements = parseFloat(indexHtmlString.charAt(findTheNum-1));
    let incrementNumElements = ++numOfElements;
    let htmlArray = indexHtmlString.split('\n');
    htmlArray.splice(10,1,`<h3>There are ${incrementNumElements}</h3>`);
    indexHtmlString = htmlArray.join(`\n`);
    fs.writeFile('public/index.html', indexHtmlString, 'utf8');
  });
};
// const updateIndex = (req, reqBody) => {
//   fs.readFile('public/index.html', (err, data) => {
//     let indexFile = data.toString();
//     let findTheNum = indexFile.indexOf(`</h3>`);
//     let numOfElements = parseFloat(indexFile.charAt(findTheNum-1));
//     let incrementNumElements = ++numOfElements;
//     let htmlArray = indexFile.split('\n');
//     htmlArray.splice(10,1,`<h3>There are ${incrementNumElements}</h3>`);
//     indexFile = htmlArray.join(`\n`);
//     fs.writeFile('public/index.html', indexFile, 'utf8');

//     let theOL = indexFile.search('</ol>');

//     let newElement =
//     `
//     <li>
//       <a href='${req.url}'> ${reqBody.elementName}</a>
//     </li>
//     `;

//     let output = [indexFile.slice(0, theOL), newElement, indexFile.slice(theOL)].join('');

//     fs.writeFileSync('public/index.html', output, 'utf8');
//     }
//   );
// };

const htmlTemplate = (reqBody) => (
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements - ${reqBody.elementName}</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <h1>${reqBody.elementName}</h1>
  <h2>${reqBody.elementSymbol}</h2>
  <h3>Atomic number ${reqBody.elementAtomicNumber}</h3>
  <p>${reqBody.elementDescription}</p>
  <p><a href="/index.html">back</a></p>
</body>
</html>`
);