var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');

module.exports = function UsersRequestHandler(mysql_config, model, tokens) {
  var router = express.Router();

  router.use(new bodyParser());

  router.post('/new', function(req, res) {
      model.insert(req.body.user, function(err, data) {
          res.json(err ? err : data);
      });
  });

  router.get('/:id', function(req, res) {
      model.read('id', req.params.id, function(err, data) {
          if (data) {
            delete data.password;
          }

          res.json(err ? err : data);
      })
  });

  router.post('/auth', function(req, res) {
      model.read('username', req.body.username, function(err, data) {
          if (data) {
              if (data.password === req.body.password) {
                  delete data.password;

                  var token = tokens.createToken({
                      user_id: data.id
                  });

                  data.token = token;
                  return res.json(data);
              }
          }

          res.status(403).json({
              err: "Incorrect credentials."
          });
      })
  })

  return router;
}