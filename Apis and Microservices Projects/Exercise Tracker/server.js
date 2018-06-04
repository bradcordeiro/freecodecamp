var bodyParser = require("body-parser");
var express = require("express");

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
var MongoClient = require("mongodb").MongoClient;
var users;

const word_regex=/^\w+$/
const date_regex=/^\d{4}-\d{1,2}-\d{1,2}$/


app.use(express.static("public"));
app.get("/", function (request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

app.post("/api/exercise/new-user", new_user);

app.post("/api/exercise/add", add_exercise);

app.get("/api/exercise/log", get_history);

// listen for requests :)
MongoClient.connect(process.env.MONGO_URL, {}, function (err, client) {
  if (err) {
    console.log(err);
    throw err;
  }

  users = client.db("fccexercisetracker").collection("users");
  var listener = app.listen(process.env.PORT, function () {
    console.log("Your app is listening on port " + listener.address().port);
  });
});

function new_user(request, response) {
  if (word_regex.test(request.body.userId)) {
    users.insert({ name: request.body.userId, history: [] }, {}, function (err, data) {
      if (err) {
        console.log(err);
        response.sendStatus(500);
      } else {
        response.sendStatus(200);
      }
    });
  } else {
    response.sendStatus(400);
  }
}

function add_exercise(request, response) {
  const formatted_date = new Date(request.body.date).getTime();

  if (!word_regex.test(request.body.userId) || !date_regex.test(request.body.date)) {
    response.status(400).json( { error: "Date must be formatted as YYYY-MM-DD" });
    return;
  }

  users.findOneAndUpdate( {
    name: request.body.userId
  }, {
    $push: {
      history : {
        description: request.body.description,
        duration: request.body.duration,
        date: formatted_date,
      }
    }
  },
  {},
  function (err, result) {
    if (err) {
      console.log(err);
      response.sendStatus(500);
    } else {
      response.sendStatus(200);
    }
  }
);
}

function get_history(request, response) {
  console.log(request.query);
  
  // finiding history requires a username
  if (!request.query.userId) {
    response.status(400).json({ error: "Username is required." });
    return;
  }
  
  // start building query for mongodb
  const query = {
    name: request.query.userId
  };
  
  // query options
  const query_options = {
    projection: {
      _id: 0,
      name: 0,
    },
  }
  
  if (!Number.isNaN(request.query.limit)) {
    query_options.limit = parseInt(request.query.limit, 10);
  }

  // sanitize and add start date to query
  if (request.query.from !== "") {
    if (!date_regex.test(request.query.from)) {
      response.status(400).json( { error: "Date must be formatted as YYYY-MM-DD" });
      return;
    } else {
      query["history.date"] = {};
      query["history.date"]["$gte"] = new Date(request.query.from).getTime(); 
    }
  }
  
  // sanitize and end date to query
  if (request.query.to !== "") {
    if (!date_regex.test(request.query.to)) {
      response.status(400).json({ error: "Date must be formatted as YYYY-MM-DD" });
      return;
    } else {
      if (Object.prototype.hasOwnProperty.call(query, "history.date")) {
        query["history.date"] = {};
      } 
      query["history.date"]["$lte"] = new Date(request.query.to).getTime();
    }
  }

  console.log(query);
  console.log(query_options);
  
  users.findOne(query, query_options, function (err, result) {
    if (err) {
      console.log(err);
      response.sendStatus(400);
    } else {
      console.log(result);
      if (result && result.history) {
        response.json(result.history.map(function(element) {          
          let time = new Date();
          time.setTime(element.date);
          element.date = time;
          return element;
          console.log(element);
        }));
      } else {
        response.json([]);
      }
    }
  });
}