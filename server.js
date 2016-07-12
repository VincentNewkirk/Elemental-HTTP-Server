const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

/**********************
***********SERVER***********
**********************/

const server = http.createServer((req, res) =>  {
  if(req.method === 'GET'){
    getFunction(req, res);
  } else if(req.method === 'POST'){
    if(checkAuthorization(req,res)){
    updateIndexHtml(req, res);
    postFunction(req, res);
    }
  } else if(req.method === 'PUT'){
    if(checkAuthorization(req, res)){
      putFunction(req, res);
    }
  } else if(req.method === 'DELETE'){
    if(checkAuthorization(req, res)){
      decrementIndexHtml(req, res);
      deleteFunction(req, res);
    }
  }
});

server.listen('8080');

/***************************************
**************FUNCTIONS*************
***************************************/
const checkAuthorization = (req, res) => {
  if(req.headers.authorization === undefined){
    res.writeHead(401, {
      'WWW-authenticate':'Basic realm ="Secure Area"',
    });
    res.end();
    return false;
  } else {
    const userPass = 'zerocool:love';
    let codedString = req.headers.authorization.slice(6);
    let base64Buffer = new Buffer(codedString, 'base64');
    let decodedStr = base64Buffer.toString();
      if(decodedStr !== userPass){
        res.writeHead(401, {
        'WWW-authenticate':'Basic realm ="Secure Area"',
        });
        res.end('<html><body>Not Authorized</body></html>');
        return false;
      } else{
        console.log('User authenticated. Method: ', req.method);
        return true;
      }
  }
};

const getFunction = (req, res) => {
  if(req.url === '/'){
    req.url = '/index.html';
  }
  fs.readFile('public' + req.url, (err, data) => {
    if(err !== null){
      res.writeHead(404);
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
    fs.writeFileSync('public' + req.url, htmlTemplate(reqBody));
    res.end();
  });
};

const putFunction = (req, res) => {
  fs.readFile('public' + req.url, (err, data) => {
    if(err !== null){
      res.writeHead(500, {
        'Content-type':'application/json',
        "error" : `resource ${req.url} does not exist`,
        });
      res.end();
    } else {
      postFunction(req, res);
    }
  });
};

const deleteFunction = (req, res) => {
  fs.readFile('public' + req.url, (err, data) => {
    if(err !== null){
      res.writeHead(500, {
        'Content-type':'application/json',
        'error':`resource ${req.url} does not exist`,
      });
      res.end();
    } else {
      res.writeHead(200, {
        'Content-type':'application/json',
        'success': true,
      });
      fs.unlinkSync('public' + req.url);
      res.end();
    }
  });
};

const updateIndexHtml = ( req, res ) =>{
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
      fs.writeFileSync('public/index.html', indexHtmlString, 'utf8');
    });
  });
};

const decrementIndexHtml = (req, res)  => {
  fs.readFile('public/index.html', (err, data) => {
    let indexHtmlString = data.toString();
    //decrement counter in header
    let findTheNum = indexHtmlString.indexOf(`</h3>`);
    let numOfElements = parseFloat(indexHtmlString.charAt(findTheNum-1));
    let decrementNumElements = --numOfElements;
    let htmlArray = indexHtmlString.split('\n');
    htmlArray.splice(10,1,`<h3>There are ${decrementNumElements}</h3>`);
    indexHtmlString = htmlArray.join(`\n`);
    //store the req.url element name so we can search for it
    let elementName = req.url.split('');
    for(var i = 0; i < 5; i++){
      elementName.pop();
    }
    //use the last 3 letters of the element as the search start point
    let tempArr = [];
    for(var i =0; i<4; i++){
      tempArr += elementName.pop();
    }
    tempArr = tempArr.split('');
    tempArr.reverse();
    tempArr = tempArr.join('');
    tempArr = tempArr + '</a>';
    elementName = tempArr;

    //store the string up to the li tag we want to delete
    let firstHalfMarker = indexHtmlString.indexOf(`${req.url}`) - 22;
    let firstHalf = indexHtmlString.slice(0, firstHalfMarker);
    //store the rest of the string from the end of the li we want to delete
    let secondHalfMarker = indexHtmlString.indexOf(elementName) + 20;
    let secondHalf = indexHtmlString.slice(secondHalfMarker);
    //join the two strings together
    let wholeString = [firstHalf, secondHalf].join('');
    fs.writeFileSync('public/index.html', wholeString, 'utf8');
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
