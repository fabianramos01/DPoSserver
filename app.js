const express = require('express');
const path = require('path');
const logger = require('morgan');

// var indexRouter = require('./routes/index');

const port = 3050;
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('port', process.env.PORT || port);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.listen(app.get('port'), () => console.log(`Example app listening on port ${app.get('port')}!`));
