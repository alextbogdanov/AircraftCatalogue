const express = require('express')
const path = require('path')
const exphbs  = require('express-handlebars');
const mongoose = require('mongoose')      
const bodyParser = require('body-parser')      
const expressValidator = require('express-validator')
const session = require('express-session')
const passport = require('passport')

const config = require('./config/database')

// Set Up MongoDB
mongoose.connect(config.database, { useNewUrlParser: true })
let db = mongoose.connection

// Check DB Connection
db.once('open', function() {
    console.log('Connected to MongoDB')
})

// Check DB For Errors
db.on('error', function(err) {
    console.log(err)
})

// Init App
const app = express()

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Express Session Middleware
app.use(session({
    secret: 'somesecret',
    resave: true,
    saveUninitialized: true
  }));
  

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Passport Config
require('./config/passport')(passport)

// Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

app.get('*', function(req, res, next) {
    res.locals.user = req.user || null
    next()
})

// Set Up HandleBars
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: __dirname + '/views/layouts',
  helpers: require('./helpers/ifeq-ifnoteq.js')
})

app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

// Use css, images & js files
app.use(express.static(path.join(__dirname, '/public')))
app.use('/users', express.static(path.join(__dirname, 'public')))
app.use('/users/profile', express.static(path.join(__dirname, 'public')))
app.use('/aircrafts', express.static(path.join(__dirname, 'public')))
app.use('/aircrafts/add-spec/:spec_type/:aircraft_id', express.static(path.join(__dirname, 'public')))
app.use('/aircrafts/change-spec/:spec_type/:aircraft_id', express.static(path.join(__dirname, 'public')))
app.use('/aircrafts/remove-spec/:spec_type/:aircraft_id', express.static(path.join(__dirname, 'public')))
app.use('/aircrafts/model', express.static(path.join(__dirname, 'public')))
app.use('/aircrafts/model/:id/:spec', express.static(path.join(__dirname, 'public')))
app.use('/admin', express.static(path.join(__dirname, 'public')))
app.use('/admin/add-submissions/:id', express.static(path.join(__dirname, 'public')))
app.use('/admin/change-submissions/:id', express.static(path.join(__dirname, 'public')))
app.use('/admin/remove-submissions/:id', express.static(path.join(__dirname, 'public')))

// Import Routes
const users = require('./routes/users')
const aircrafts = require('./routes/aircrafts')
const admin = require('./routes/admin')

// Use Routes
app.use('/users', users)
app.use('/aircrafts', aircrafts)
app.use('/admin', admin)

app.get('/', (req, res) => {
    res.render('index', { expressFlash: req.flash(), sessionFlash: res.locals.sessionFlash })
})

app.listen(process.env.PORT || 3000, function(){
  console.log('Server Started');
});