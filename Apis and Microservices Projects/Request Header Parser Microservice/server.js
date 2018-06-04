var express = require('express');
var app = express();


app.get("/", function (request, response) {
  var output = {};
  
  var rIp = /\d+\.\d+\.\d+\.\d+/;
  var rLanguage = /\w+-\w+/;
  var rOs = /\((.+?)\)/;

  var ipAddressSearch = rIp.exec(request.headers["x-forwarded-for"]);
  output.ipaddress = ipAddressSearch ? ipAddressSearch[0] : "Undiscoverable";
  
  var languageSearch = rLanguage.exec(request.headers["accept-language"]);
  output.language = languageSearch ? languageSearch[0] : output.language = "Unknown Language";
  
  var osSearch = rOs.exec(request.headers["user-agent"]);
  output.software = osSearch ? osSearch[1] : output.os = "Unknown Operating System";
  
  response.json(output);
  response.end();
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
