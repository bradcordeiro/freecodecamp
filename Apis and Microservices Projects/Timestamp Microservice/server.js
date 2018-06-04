var strftime = require('strftime');
var express = require('express');
var app = express();

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});



app.get("/:dateString", function (request, response) {
  var naturalR = /[a-zA-Z]+ \d+, \d+/;
  var unixR = /\d+/;
  var dateString = request.params.dateString; 
  console.log(dateString);
  
  if (naturalR.test(dateString)) {
    var timeStamp = new Date(dateString);
  } else if (unixR.test(dateString)) {
    // Javascript uses milliseconds, Unix uses seconds, so multiply by 1000
    var epoch = parseInt(dateString, 10) * 1000;
    var timeStamp = new Date(epoch);
  }
  
  if (timeStamp) {
    var obj = {
      unix: timeStamp.getTime(),
      natural: strftime("%B %e, %Y", timeStamp)
    }
  } else {
    var obj = { unix: null, natural: null };
  }
  
  response.json(obj);
  response.end();
  
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
