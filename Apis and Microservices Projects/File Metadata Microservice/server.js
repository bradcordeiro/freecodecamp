var express = require('express');
var app = express();
app.use(express.static('public'));

var multer  = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/upload", upload.single('forSizing'), function (req, res, next) {
  var fileSize = req.file.size;
  res.json({size: fileSize});
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
