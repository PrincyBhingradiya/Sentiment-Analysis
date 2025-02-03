//required npm for modules
const express = require('express');
const router = express.Router();
app = module.exports = express();
bcrypt = module.exports = require('bcrypt');
jwt = module.exports = require('jsonwebtoken');
nodemailer = module.exports = require('nodemailer');
// const redis = require('redis');
// const client = redis.createClient(); 
//body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

require("dotenv").config();

//database connection
mongoose = module.exports = require('mongoose');
mongoose.connect(process.env.MONGO_URL).then(() => console.log('Connected!'));

//variable exports
JWT_SECRET = module.exports = process.env.JWT_SECRET;

//required all setting files
require("./settings/url_setting.js");
require("./controllers/controller_settings.js");
require("./middleware/authenticate.js");


//server start
const port = process.env.PORT || 8000;
app.listen(port, () => {
	console.log(`Success ${port}`);
});

//notification schedule task

 cron = require('node-cron'); // For scheduling tasks
