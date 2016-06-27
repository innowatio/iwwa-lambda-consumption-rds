[![Build Status](https://travis-ci.org/innowatio/iwwa-lambda-consumption-rds.svg?branch=master)](https://travis-ci.org/innowatio/iwwa-lambda-consumption-rds)
[![codecov](https://codecov.io/gh/innowatio/iwwa-lambda-consumption-rds/branch/master/graph/badge.svg)](https://codecov.io/gh/innowatio/iwwa-lambda-consumption-rds)
[![Dependency Status](https://david-dm.org/innowatio/iwwa-lambda-consumption-rds.svg)](https://david-dm.org/innowatio/iwwa-lambda-consumption-rds)
[![devDependency Status](https://david-dm.org/innowatio/iwwa-lambda-consumption-rds/dev-status.svg)](https://david-dm.org/innowatio/iwwa-lambda-consumption-rds#info=devDependencies)


# iwwa-lambda-consumption-rds

Lambda function for consumption infos

## Deployment

This project deployment is automated with Lambdafile [`lambda-boilerplate`](https://github.com/lk-architecture/lambda-boilerplate/).

### Configuration

The following environment variables are needed to configure the function:

- `DB_USER`
- `DB_PASS`
- `DB_URL`
- `DB_NAME`

### Run test

In order to run tests locally a Postgres instance and the above environment
variables are needed.
Then, just run `npm run test` command.
