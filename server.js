const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
let elementCounter = 2;

/**********************
***********SERVER***********
**********************/

const server = http.createServer((req, res) =>  {
  if(req.method === 'GET'){
    getFunction(req, res);
  } else if(req.method === 'POST'){
    updateIndexHtml(req, res);
    postFunction(req, res);
  } else if(req.method === 'PUT'){
    putFunction(req, res);
  }
});

server.listen('8080');


/***************************************
**************FUNCTIONS*************
***************************************/

const putFunction = (req, res) => {
  fs.readFile('public' + req.url, (err, data) => {
    if(err !== null){
      res.writeHead(500, {
        'Content-type':'application/json',
        "error" : "resource /carbon.html does not exist",
        });
      res.end();
    } else {
      postFunction(req, res);
    }
  });
};

const getFunction = (req, res) => {
  if(req.url === '/'){
    req.url = '/index.html';
  }
  fs.readFile('public' + req.url, (err, data) => {
    if(err !== null){
      res.writeHead(404)
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

    res.writeHead(200, {
      'Content-type' : 'application/json',
      'success' : true});

    fs.writeFile('public' + req.url, htmlTemplate(reqBody));
    res.end();
  });
};

const updateIndexHtml = ( req, reqBody ) =>{
  req.on('data', (data) => {
    const reqBody = querystring.parse(data.toString());
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
  });
};

/************************
************TEMPLATE************
************************/

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
