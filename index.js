var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var dataUtil = require("./data-util")
var app = express();
var _ = require("underscore");

var _DATA = dataUtil.loadData().books;

//MIDDLEWARE
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));

/* Add whatever endpoints you need! Remember that your API endpoints must
 * have '/api' prepended to them. Please remember that you need at least 5
 * endpoints for the API, and 5 others.
 */

/* ADD DATA */ 
app.get("/create", function(req, res) {
  res.render('create');
});

//html form
app.post('/create', function(req, res) {
  var contains = false;
  var body = req.body;
  _.forEach(_DATA, function(i) {
    if (body.title == i['title']) {
      if (body.descriptors) {
        i['descriptors'].join(body.descriptors.split(','))
      }
    }
  })  
  if (!contains) {
    body.descriptors = body.descriptors.split(',');
    _DATA.push(req.body);
    dataUtil.saveData(_DATA);
  }
    res.redirect("/");
});

//post request
app.post('/api/create', function(req, res) {

  if(!req.body) { return res.send("No data recieved"); }
  var contains = false;
  var body = req.body;
  _.forEach(_DATA, function(i) {
    if (body.title == i['title']) {
      if (body.descriptors) {
        i['descriptors'].join(body.descriptors.split(','))
      }
    }
  })  
  if (!contains) {
    body.descriptors = body.descriptors.split(',');
    _DATA.push(req.body);
    dataUtil.saveData(_DATA);
  }
}); 

/* VIEW DATA */

//html page
app.get('/', function(req, res) {
  res.render('home', {
    data: _DATA
  });  
});

//get request
app.get('/api/getBooks', function(req, res) {
  var contents = "";
  _.each(_DATA, function(i) {
    contents += makeTable(i)
  })
  var html = '<html>\n<body>\n' + contents + '\n</body>\n</html>'
  res.send(html);  
});

/* SEARCH DATA -> search on title*/
//view main.handlebars

/*NAVIGATION PAGES*/
app.get('/recent', function(req, res) {
  var today = new Date().getFullYear()
  var objs = []
  _.forEach(_DATA, function(i){
    if ((i['year']+2) >= today) {
      objs.push(i);
    }
  })
  res.render('recent', {
    data: objs
  });  
}); 

app.get('/genre/:book_genre', function(req, res) {
  var _genre = req.params.book_genre;
  var objs = []
  _.forEach(_DATA, function(i){
    if (i['genre'] == _genre) {
      objs.push(i);
    }
  })
  res.render('genre', {
    data: objs,
    genre: _genre
  }); 
});

app.get('/historicalReads', function(req, res) {
  var objs = []
  _.forEach(_DATA, function(i){
    if (i['year'] < 1900) {
      objs.push(i);
    }
  })
  res.render('historical', {
    data: objs,
  }); 
});

app.get('/random', function(req, res) {
  var rand = Math.round(Math.random() * (_DATA.length-1))
  var objs = []
  var idx = 0;
  _.forEach(_DATA, function(i){
    if (idx == rand) {
      objs.push(i);
    }
    idx++;
  })
  res.render('random', {
    data: objs,
  }); 
});

app.get('/alphabetical', function(req, res) {
  var objs = [..._DATA]
  objs.sort((a,b) => (a['title'] > b['title']) ? 1 : -1);
  res.render('alphabetical', {
    data: objs,
  }); 
});


app.listen(3000, function() {
    console.log('Listening on port 3000!');
});

function makeTable(obj) {
  var title = i["title"]
  var author = i['author']
  var year = i['year']
  var genre = i['genre']
  var descr = i['descriptors']

  contents += '<table><tr><td><strong>' + title + '</strong> by ' + author + '</td></tr>'
  contents += '<tr><td> Genre: ' + genre + '</td></tr>'
  contents += '<tr><td> Year Published: ' + year + '</td></tr>' 
  contents += '<tr><td> Reviews: </td></tr><br>'
  
  var idx = 0
  for (var d in decr) {
    idx += 1;
    contents += '<tr><td>' + idx + '. ' + decr[d] + '</td></tr>'     
  }

  contents += '</table>'
}
