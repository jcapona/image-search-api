var MONGOLAB_URI="mongodb://example:example@ds037415.mongolab.com:37415/url-shortener";

var mongo = require('mongodb').MongoClient;
var express = require('express');
var app = express();

// ROUTES 
app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'jade');

app.get("/", function(request, response) {
  response.render("index");
});

app.get("/latest", function(request, response) {
  
  getLatest(function(err,resp){
    if(err)
    {
      console.error(err);
      response.end(err);
    }
    else
    {
      if(resp == null)
        response.end(JSON.stringify({"error":"No history"}));
      else
        response.end("Displaying latest queries");
    }
  });  
});

app.get("/imagesearch/*", function(request, response) {
  search(request.params[0],function(err,resp){
    if(err)
    {
      console.error(err);
      response.end(err);
    }
    else
    {
      if(resp == null)
        response.end(JSON.stringify({"error":"No images found for given input"}));
      else
        response.end("Displaying images");
    }
  });
});

app.get("*", function(request, response) {
  response.redirect("/");
});


app.listen(app.get('port'));


function search(str, callback)
{
  callback(str);
}

function getLatest(callback)
{
  callback("Latest");
}
