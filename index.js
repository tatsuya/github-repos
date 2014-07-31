#!/usr/bin/env node

var https = require('https');
var qs = require('querystring'); 

function usage() {
  console.log('Usage: node ./index.js octocat');
}

function request(repos, username, page, callback) {
  repos = repos || [];
  page = page || 1;

  var params = {
    'page': page,
    'per_page': 100
  };

  var options = {
    hostname: 'api.github.com',
    path: '/users/' + username + '/repos?' + qs.stringify(params),
    headers: {
      'User-Agent': 'Github-Repos-App'
    }
  };

  var req = https.get(options, function(res) {
    var str = '';

    res.on('data', function(chunk) {
      str += chunk;
    });

    res.on('end', function() {
      var obj;
      try {
        obj = JSON.parse(str);
      } catch (e) {
        callback(new Error('Problem parsing JSON: ' + e.message + '\n' + 'Response body: ' + str));
      }

      repos = repos.concat(obj);

      if (obj.length < params['per_page']) {
        callback(null, repos);
      } else {
        request(repos, username, page + 1, callback);
      }
    });
  });

  req.on('error', callback);

  req.end();
}

if (process.argv.length < 3) {
  usage();
  process.exit(1);
}

var username = process.argv[2];

console.log('Fetching public repositories for "' + username + '"...');

request(null, username, null, function(err, repos) {
  if (err) {
    console.log('Got error: ' + err.message);
  } else {
    console.log(repos.length + ' repo(s) are found!');
  }
});
