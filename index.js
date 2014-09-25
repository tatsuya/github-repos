#!/usr/bin/env node
'use strict';

var parseArgs = require('minimist');
var https = require('https');
var qs = require('querystring');

/**
 * Print usage.
 */
function usage() {
  [
    '',
    '  Usage: node index.js [options]',
    '',
    '  Options:',
    '',
    '    -u, --user   List repos for specified user',
    '    -o, --org    List repos for specified organization',
    '',
    '  Examples:',
    '',
    '    $ node index.js --user octocat',
    '    $ node index.js -o github',
    ''
  ].forEach(function(line) {
    console.log(line);
  });
}

/**
 * Print fetching message.
 *
 * @param {String} target
 */
function fetching(target) {
  console.log('Fetching public repositories for "' + target + '"...');
}

/**
 * Send an request.
 *
 * @param  {Array}    repos
 * @param  {String}   path
 * @param  {Number}   page
 * @param  {Function} callback
 */
function request(repos, path, page, callback) {
  repos = repos || [];
  page = page || 1;

  var params = {
    'page': page,
    'per_page': 100
  };

  var options = {
    hostname: 'api.github.com',
    path: path + '?' + qs.stringify(params),
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
        request(repos, path, page + 1, callback);
      }
    });
  });

  req.on('error', callback);

  req.end();
}

/**
 * Parse response.
 *
 * @param  {Object} err
 * @param  {Array} repos
 */
function response(err, repos) {
  if (err) {
    console.log('Got error: ' + err.message);
    return;
  }

  repos.forEach(function(repo) {
    console.log();
    console.log(repo['html_url']);
    console.log(repo['description']);
  });
}

var argv = parseArgs(process.argv.slice(2));

var user, org, path;

user = argv.user || argv.u;
org = argv.org || argv.o;

if (typeof user === 'string') {
  path = '/users/' + user + '/repos';
  fetching(user);
} else if (typeof org === 'string') {
  path = '/orgs/' + org + '/repos';
  fetching(org);
} else {
  usage();
  process.exit(1);
}

request(null, path, null, response);