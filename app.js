const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const ejs = require('ejs');
const morgan = require("morgan");
const key = require("./keys/connectionkey");
const cors =require("cors");

//database connection setup
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(key.connectionURI,{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=> console.log("Connection established!!"))
.catch((err)=> console.log("Error while connectiong to mongoDB"));
//database connection end


const routes = require('./routes/route');
const users = require('./models/usermodel');


//user defined middleware
const requestLogger = require('./utilities/requestLogger');
const errorLogger = require('./utilities/errorLogger');

//application level middleware
let myLogger = (req,res,next)=>{
    console.log(req.path);
    console.log(req.method);
    console.log(Date.now());
    next();

}

const app = express();
//middlewares used 
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');

var accessLogStream =fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'})
app.use(morgan('combined',{stream:accessLogStream}))
app.use(myLogger);
app.use(requestLogger);

app.use('/',routes);
//error logger should be called after the routes because we are searching for all the errors 
app.use(errorLogger);
app.use('/users',users);

app.listen('8081',function(req,res){
    console.log("Connected !!You are listening to port 8081");
})
