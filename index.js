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
      if(response == null)
        response.end(JSON.stringify({"error":"No history"}));
      else
        response.end("Displaying latest queries");
    }
  });  
});

app.get("/imagesearch/*", function(request, response) {
  searchImgs(request.params[0],function(err,resp){
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
        response.end(JSON.stringify(resp,null,2));
    }
  });
});

app.get("*", function(request, response) {
  response.redirect("/");
});


app.listen(app.get('port'));


function getLatest(callback)
{
  callback("Latest");
}

function searchImgs(str, callback)
{
  var google = require('googleapis');
  var customsearch = google.customsearch('v1');

  const CX = '010473170237434595792:z_8lctunzfu';
  const API_KEY = 'AIzaSyANNn0S6K_8ytUuCH15l1bROI9S33CpQSk';
  const SEARCH = str;

  customsearch.cse.list({ cx: CX, q: SEARCH, auth: API_KEY, searchType: "image"}, function(err, resp) 
  {
    if (err) {
      console.log('An error occured', err);
      callback(err,null);
    }

    console.log('Result: ' + resp.searchInformation.formattedTotalResults);
    if (resp.items && resp.items.length > 0) 
    {
      makeImgArr(resp.items,function(err,arr){
        if (err) {
          console.error(err);
          callback(err,null);
        }   
        else
          callback(null,arr);
      });  

    }

  });
}

function makeImgArr(itemArr, callback)
{
  var resArr = [];
  for(var i=0; i<10; i++)
  {
    var obj = {};
    obj.url = itemArr[i].link;
    obj.snippet = " "
    obj.thumbnail = itemArr[i].image.thumbnailLink;
    obj.context = itemArr[i].image.contextLink;
    resArr.push(obj);
  }
  callback(null,resArr);
}

