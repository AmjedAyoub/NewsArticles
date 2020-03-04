var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");
var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(express.static("public"));


// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/NewsScraperDBtest", { useNewUrlParser: true });

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://user1:password1@ds339348.mlab.com:39348/heroku_bcxd71m4";
mongoose.connect(MONGODB_URI);

// Data
var articles = [];

// Routes  
app.get("/", function(req, res) {
    res.render("index", { articles: articles });
});

app.get("/clear", function(req, res) {
    articles = [];
    res.json(articles);
});

app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.seattletimes.com/seattle-news/politics/").then(function(response) {
        // console.log(response.data);
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        articles = [];
        // Now, we grab every h2 within an article tag, and do the following:
        $("article").each(function(i, element) {
            // Save an empty result object
            var result = {};
            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("div").children("h3").children("a")
                .text();
            result.link = $(this)
                .children("div").children("h3").children("a")
                .attr("href");
            result.body = $(this)
                .children("div").children("p")
                .text();
            // console.log(result);
            if (result.title) {
                articles.push(result);
            }
        }).catch(function (error) {
            console.log(error);
        });

        // Send a message to the client        
        // res.render("index", { articles: articles });
        // res.send("Scrape Complete");
        // console.log(articles);
        res.json(articles);

    });
});

app.post("/articles", function(req, res) {
    // console.log("req.body inside server    ", req.body);
    db.Article.create(req.body)
        .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
        })
        .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
        });
});

app.get("/saved", function(req, res) {
    db.Article.find({})
        .then(function(dbarticle) {
            // If all Notes are successfully found, send them back to the client
            // res.json(dbarticle);            
            res.render("saved", { articles: dbarticle });
        })
        .catch(function(err) {
            // If an error occurs, send the error back to the client
            res.json(err);
        });
});

app.get("/delete/:id", function(req, res) {
    // Remove a note using the objectID
    // console.log("req.body", req.params)
    db.Article.remove({
            _id: mongojs.ObjectID(req.params.id)
        },
        function(error, removed) {
            // Log any errors from mongojs
            if (error) {
                console.log(error);
            } else {
                // Otherwise, send the mongojs response to the browser
                // This will fire off the success function of the ajax request
                console.log(removed);
                res.json(removed);
            }
        }
    );
});

app.post("/articles/:id", function(req, res) {
    // TODO
    // ====
    // save the new note that gets posted to the Notes collection
    // then find an article from the req.params.id
    // and update it's "note" property with the _id of the new note
    db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
    //   console.log("articleID",req.params.id)
    //   console.log("noteID",dbNote._id)
      return db.Article.update({ _id: req.params.id }, {$push: { note: dbNote._id }})
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        console.log("dbArticle",dbArticle)
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
    })
    
});
app.get("/articles/:id", function(req, res) {
    // TODO
    // ====
    // Finish the route so it finds one article using the req.params.id,
    // and run the populate method with "note",
    // then responds with the article with the note included
    // console.log(req.params.id)
    db.Article.find({
            _id: mongojs.ObjectId(req.params.id)
        })
        .populate("note")
        .then(function(dbarticle) {
            // If all Notes are successfully found, send them back to the client
            // console.log("hereeeeeeeeeeeee", dbarticle);
            res.json(dbarticle);
        })
        .catch(function(err) {
            // If an error occurs, send the error back to the client
            res.json(err);
        });
});

app.get("/deleteNote/:id", function(req, res) {
    // Remove a note using the objectID
    // console.log("req.body", req.params)
    db.Note.remove({
            _id: mongojs.ObjectID(req.params.id)
        },
        function(error, removed) {
            // Log any errors from mongojs
            if (error) {
                console.log(error);
            } else {
                // Otherwise, send the mongojs response to the browser
                // This will fire off the success function of the ajax request
                console.log(removed);
                res.json(removed);
            }
        }
    );
});

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
    // Log (server-side) when our server has started
    console.log("Server listening on: http://localhost:" + PORT);
});