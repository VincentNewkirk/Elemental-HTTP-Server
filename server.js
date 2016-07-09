const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const server = http.createServer((req, res) =>  {
  if(req.method === 'GET'){
    getFunction(req, res);
  } else if(req.method === 'POST'){
    postFunction(req, res);
  }
});

server.listen('8080');

const getFunction = (req, res) => {
  fs.readFile(req.url, (err, data) => {
    if(err){
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
    // fs.writeFile('./public' + req.url, querystring.parse(data.toString()).toString());
    console.log(querystring.parse(data.toString()));
    res.end();
  });
};

const htmlTemplate = (req) => {
  const title = req.url;
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements - Helium</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <h1>${title}</h1>
  <h2>H</h2>
  <h3>Atomic number 2</h3>
  <p></p>
  <p><a href="/">back</a></p>
</body>
</html>`
}