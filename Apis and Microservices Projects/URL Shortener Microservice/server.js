// init project
var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var MongoURI = process.env.MONGO_URI;

// For landing page
app.use(express.static('public'));
app.get("/", function(request, response){
  response.sendFile(__dirname + '/views/index.html');
});

// Get forwarded to the full url
app.get("/:id", function(request, response) {
  var validIDregex = /\d+/;
  if (!validIDregex.test(request.params.id)){
    response.json({ error: "That is not a valid short URL." });
  } else {  
    var destinationUrl = "";
    var queryId = parseInt(request.params.id, 10);
    MongoClient.connect(MongoURI, function(err, db) {
      if (err) {
        response.json({"error":"That is not a valid short URL."});
      } else {
        console.log("Looking for id " + queryId);
        db.collection('links').findOne({
          short_url: queryId
        }, function(err, result) {
          if (err) {
            response.json({"error":"That is not a valid short URL."});
          } else if (result === null) {
            response.json({"error":"That is not a valid short URL."});
          } else {
            console.log(result);
            response.redirect(result.original_url);
          }
        })
      }
    })
  }
});


// Add a new shortened URL
app.get("/new/:link*", function(request, response) {
  var output = JSON.stringify(request.params);
  var fullUrl = request.params["link"] + request.params["0"];  
  var rUrl = /http(s)?:\/\/.*/;
  var shortenedIndex;
  var obj = {};

  if (rUrl.test(fullUrl)) {
    MongoClient.connect(MongoURI, function(err, db) {
      if (err) {
        response.json({ error: "Error connecting to database." });
      } else {
        db.collection('links').count(function(err, result){        
          obj = { original_url: fullUrl, short_url: result };
          db.collection('links').insert(obj, function(err, r){
            if (err) {
              response.json({ error: "Error writing to database" });
            } else {
              obj.short_url = "https://treasure-fibre.glitch.me/" + result;
              delete obj["_id"];
              response.json(obj);
              response.end;
            }
          });
        });
      }
    });
  } else {
    response.json({ error: "Wrong URL format, make sure you have a valid protocol and real site." });
  }
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
