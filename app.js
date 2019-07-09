const express = require('express');
const path = require('path');
const morgan = require('morgan');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');

const algorithm = require('./routes/algorithm');

const port = 3050;
const app = express();
const server = http.Server(app);
algorithm(server, app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('port', process.env.PORT || port);
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', algorithm);

server.listen(app.get('port'), () => console.log(`Example app listening on port ${app.get('port')}!`));
