# ODE Feature Service [![Build Status](https://travis-ci.org/Project-ODE/FeatureService.svg?branch=master)](https://travis-ci.org/Project-ODE/FeatureService)

REST API for ODE features data

Adapted from [Restbase](https://github.com/wikimedia/restbase)

## Installation

Make sure you have node 6+ installed

### Debian / ubuntu

```sh
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_6.x | bash - && apt-get install -y nodejs
```

From the `FeatureService` directory, install node dependencies:

```sh
npm install
```

Start FeatureService:

```sh
node server
```

The defaults without a config file should work.
To customize FeatureService's behavior, copy the example config to its default location:

```sh
cp config.example.yaml config.yaml
```

You can also pass in the path to another file with the `-c` commandline option
to `server.js`.

To use authentication features, you can use the `login`/`password` default user in tests, or create a new `htpasswd` file and reference it in the yaml config file for production deployments.

### Testing

To run all the tests from a clean slate:

```
npm test
```

### Coverage

To check the test coverage, use npm, then browse the report:

```
npm run-script coverage
```

The coverage report can now be found in *&lt;project&gt;/coverage/lcov-report/index.html*.
