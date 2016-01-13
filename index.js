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
        response.end(JSON.stringify(resp));
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


// CONTROLLERS

function getLatest(callback)
{
  mongo.connect(MONGOLAB_URI, function(err, db) {
    if(err)
      return callback(err,null);

    var col = db.collection('image-search');
    col.find({},{term: 1,when: 1, _id: 0}).toArray(function(err, documents) {
      if(err) // On error
      {
        db.close();
        callback(err,null);
      }
      db.close();
      callback(null,documents);
    })
  });
}

function searchImgs(str, callback)
{
  var google = require('googleapis');
  var customsearch = google.customsearch('v1');
  const CX = '010473170237434595792:z_8lctunzfu';
  const API_KEY = 'AIzaSyANNn0S6K_8ytUuCH15l1bROI9S33CpQSk';

  customsearch.cse.list({ cx: CX, q: str, auth: API_KEY, searchType: "image"}, function(err, resp) 
  {
    if (err) {
      console.error(err);
      callback(err,null);
    }

    if (resp.items && resp.items.length > 0) 
    {
      makeImgArr(resp.items,str,function(err,arr){
        if (err) {
          console.error(err);
          callback(err,null);
        }   
        else
        {
          insert(str,function(err,resp){
            if(err)
              callback(err,null);
            else
              callback(null,arr);
          });

        }
      }); 

    }

  });
}

function makeImgArr(itemArr, query, callback)
{
  var resArr = [];
  for(var i=0; i<10; i++)
  {
    var obj = {};
    obj.url = itemArr[i].link;
    obj.snippet = query + " image.";
    obj.thumbnail = itemArr[i].image.thumbnailLink;
    obj.context = itemArr[i].image.contextLink;
    resArr.push(obj);
  }
  callback(null,resArr);
}

function insert(query,callback)
{
  mongo.connect(MONGOLAB_URI, function(err, db) {
    if(err)
      return callback(err,null);
    
    var date = new Date();
    db.collection('image-search').insert(({"term":query,"when":date.toISOString()}), function(err, result) {
      if(err)
      {
        db.close();
        return callback(err);
      }
     
      db.close();
      callback(null,true);
    });

  });
}

