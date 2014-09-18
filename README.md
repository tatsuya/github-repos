# Github Repos

A sample utility to count the number of public repositories for the specified user/org using Github API.

## Usage

```
  Usage: node index.js [options]

  Options:

    -u, --user   List repositories for specified user
    -o, --org    List repositories for specified organization

  Examples:

    $ node index.js --user octocat
    $ node index.js -o github
```

## Example

```
$ node test.js --user octocat
Fetching public repositories for "octocat"...
5 repo(s) are found!
```
