const express = require('express');
const helmet = require('helmet');
const conversions = require('./conversions.js');

const app = express();
app.use(express.static('public'));
app.use(helmet());

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/api/convert", conversions.processInput);

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
