# io/backend

Template for backend service.

## Prerequisite

* [node.js](https://nodejs.org/en/)
* [Docker](https://docs.docker.com/)
* [Dapr](https://dapr.io/)
* [MongoDB](https://www.mongodb.com/docs/drivers/node/current/)

## Develop

* [Gherkin](https://cucumber.io/docs/gherkin/)
  * used to describe use case for testing
* [husky](https://www.npmjs.com/package/husky)
  * used to auto check commit
* [CMake](https://cmake.org/)
  * Windows
    * [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/zh-hant/visual-cpp-build-tools/)
  * Unix
    * GCC

```sh
# install all dependencies
npm i

# setup self-host Dapr environment
npm run init

# (only for Windows) compile c++ addon to VS2019
npm config set msvs_version 2019

# compile WASM
npm run wasm

# compile c++ addon
npm run cmake -- rebuild

# run test
npm test
```

There are 2 way to launch **Dapr** environment.

* ### Self-Host (for develop)

```sh
# dependent services
docker-compose -f docker-compose.dev.yml up -d

# launch self-host mode
npm run dapr
```

* ### Docker-Compose (for e2e)

```sh
# launch
docker-compose -f docker-compose.e2e.yml up
```

## Release

### Docker Image

```sh
# build image
npm run dockerbuild
```
