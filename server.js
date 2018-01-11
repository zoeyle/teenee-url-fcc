// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;
var validURL = require('valid-url');
var id = require('shortid');


// var dburl = process.env.DBPROGRAM + '://' + process.env.USER +':'+ process.env.PASS + '@'+process.env.HOST + ':' + process.env.DBPORT+'/'  ;
var dburl = 'mongodb://zoeyle:angelo@ds249727.mlab.com:49727/fcc';
// var dburl = `mongodb://${encodeURIComponent(process.env.USER)}:${encodeURIComponent(process.env.PASS)}@${encodeURIComponent(process.env.HOST)}:${encodeURIComponent(process.env.DBPORT)}/${encodeURIComponent(process.env.DBNAME)}`
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// wildcard /* can include something like /new/http://host.com/whatever/ while query string cannot include /
app.get('/new/*', function(req, res){
  var url = req.params[0];
  if(validURL.isUri(url)){
    
    var entry = { "original" : url, 
                  "shortened_url" : req.protocol + '://' + req.headers.host + '/new/' + id.generate()}; 
console.log(JSON.stringify(entry));
  mongo.connect(dburl, function(err, db){
    if(err) throw err;
    // var db = client.db('fcc');
    var collection = db.collection(process.env.COLLECTION);
      collection.insert(entry, function(err2){
      if(err2) throw err2;
        
      // console.log(JSON.stringify(entry));
      
      db.close();
    });
  });
    res.end(JSON.stringify(entry));
  } else{
      console.log('Not a URI');    
  }
});

app.get('/:shortURL', function(req,res){
  
  mongo.connect(dburl, function(err, db){
    if(err) throw err;
    console.log(req.params.shortURL);
    // var db = client.db(process.env.DBNAME);
    var collection = db.collection(process.env.COLLECTION);
    collection.find({ "shortened_url" : req.protocol + '://' + req.headers.host + req.params.shortURL },//has extra /new/
                    { "shortened_url" : 0}
                   ).toArray(function(err2, doc){
                  if(err2) throw err2;
      
                  // console.log(doc[0]);
                  res.redirect(doc[0]);
    });
    db.close();
  });
});

// // could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
// app.post("/dreams", function (request, response) {
//   dreams.push(request.query.dream);
//   response.sendStatus(200);
// });

// // Simple in-memory store for now
// var dreams = [
//   "Find and count some sheep",
//   "Climb a really tall mountain",
//   "Wash the dishes"
// ];

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
