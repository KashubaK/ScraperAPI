var express = require('express');
var bodyParser = require('body-parser');
var Horseman = require('node-horseman');
var async = require('async');

var app = express();

app.use(new bodyParser());

function ScrapistAPI() {
    /*
        scrape: Scrape a web site for data, completely modular.

        Returns provided instructions with results in each instruction.
    */
    this.scrape = function(opts, cb) {
        var scraped = [];
        var h = new Horseman();

        h.userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0');
        h.open(opts.url);

        async.eachSeries(opts.instructions, function(instruction, next) {
            if (h.exists(instruction.target)) {
                switch (instruction.intent) {
                    case 'read_text':
                        h.text(instruction.target).then(function(text) {
                            scraped.push(text);

                            next();
                        });

                        break;
                    case 'read_image':
                        // Try to read the src, but if it comes up empty try the background-image CSS attribute.
                        h.attribute(instruction.target, 'src').then(function(attribute) {
                            if (attribute) {
                                scraped.push(attribute);

                                next();
                            } else {
                                h.cssAttribute(instruction.target, 'background-image').then(function(attribute) {
                                    scraped.push(attribute);

                                    next();
                                });
                            }
                        });

                        break;
                }
            } else {
                scraped.push(null);
                next();
            }
        }, function(err) {
            h.close();
            cb(err, scraped);
        });
    }
}

var scrapistAPI = new ScrapistAPI();

app.post('/api/scrape', function(req, res) {
    scrapistAPI.scrape(req.body, function(err, results) {
        res.json({
            err: err,
            results: results
        });
    });
});

app.listen(8080, function() {
    console.log("ScrapistAPI started on port 8080");
})