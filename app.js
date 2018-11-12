var express = require("express"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    User = require("./models/user.ejs"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");
    

    mongoose.connect("mongodb://127.0.0.1/restful_blogs");

  

// APP config
app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(require("express-session")({
    secret: "bla bla bla bla bla",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ===========
//    ROUTES
// ===========

// Auth Routes

//show signup form

app.get("/register", function(req,res){
    res.render("register");
});

//User Signup

app.post("/register", function(req,res){
    User.register(new User({ username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        } 
        passport.authenticate("local")(req, res, function(){
            res.redirect("/blogs/new");
        });
    });
})

// Login Routes
// Render Login Form

app.get("/login", function(req,res){
    res.render("login");
});

// Login Logic

app.post("/login", passport.authenticate("local", {
    successRedirect: "/blogs/new",
    failureRedirect: "/login"
}), function (req, res){

});

app.use(express.static("public"));
app.use(expressSanitizer());

app.use(methodOverride("_method"));

// Logout Route

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
})

//mongoose.model config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {
        type: Date,
        default: Date.now
    }
})

var Blog = mongoose.model("Blog", blogSchema);



// RESTful Routes

app.get("/", function (req, res) {
    res.redirect("/blogs");
});

app.get("/blogs", function (req, res) {
    Blog.find({}, function (err, blogs) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {
                blogs: blogs
            });
        }
    }).sort({
        _id: -1
    });

});

//new route = /secret
app.get("/blogs/new", isLoggedIn, function (req, res) {
    res.render("new");

});
//Create route
app.post("/blogs", function (req, res) {
    // req.body.blog.body = req.sanitize(req.body.blog.body);
    //create blog
    Blog.create(req.body.blog, function (err, newBlog) {
        if (err) {
            res.render("new");
        } else {
            //redirect back to list of blogs
            res.redirect("/blogs");
        }
    })
})
//show route
app.get("/blogs/:id", function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("show", {
                blog: foundBlog
            });
        }
    })
})
//Edit route
app.get("/blogs/:id/edit", isLoggedIn, function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("edit", {
                blog: foundBlog
            });
        }
    })
})

//Route update

app.put("/blogs/:id", function (req, res) {
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, updatedBlog) {
        res.redirect("/blogs/" + req.params.id);
    })
})
//Delete route
app.delete("/blogs/:id", isLoggedIn, function (req, res) {
    Blog.findByIdAndRemove(req.params.id, function (err) {
        res.redirect("blogs")
    })
})

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


app.listen(3000, function (req, res) {
    console.log("Check out the bullshit we are spurting!!!")
});


// Blog.create ({
//     title: "Blog post one - RESTful Routing + Setup",
//     image: "https://images.unsplash.com/photo-1533709752211-118fcaf03312?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=8dc93f8092096ebef36d48276c81e30e&auto=format&fit=crop&w=2850&q=80",
//     body: "Hello I am the first blog post of Marek's coding adventure!"
// })