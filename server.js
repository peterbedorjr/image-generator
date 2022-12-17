const express = require('express');

const app = express.createServer();

// If we're going to render on our side
// app.configure(function() {
//   var pub = __dirname + './public';
//   pub = require("path").normalize(pub);
//   app.set('views', __dirname + '/views');
//   app.set('view engine', 'jade');
// });

app.use(express.bodyParser());

app.get('/', function(req, res) {
  console.log(req);
  res.send('test');
});

app.listen(3000);

console.log('Created server running on http://localhost:3000');
