//required npm for modules
const express = require('express');
const router = express.Router();
app = module.exports = express();
bcrypt = module.exports = require('bcrypt');
jwt = module.exports = require('jsonwebtoken');
nodemailer = module.exports = require('nodemailer');
const serverless = require('serverless-http')
module.exports = serverless(app);
cron = require('node-cron');
mongoose = module.exports = require('mongoose');
const cors = require("cors");
require("dotenv").config();


//Middleware
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

//required all setting files
require("./settings/url_setting.js");
require("./controllers/controller_settings.js");
require("./middleware/authenticate.js");

//connect to mongoDB

console.log(process.env.MONGO_URL);
mongoose.connect(process.env.MONGO_URL).then(() => console.log('Connected!'));
JWT_SECRET = module.exports = process.env.JWT_SECRET;

//server start
const port = process.env.PORT || 8000;
app.listen(port, () => {	
	console.log(`Success ${port}`);
});
