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
# dependent services (db, ...etc)
docker-compose -f docker-compose.dev.yml up -d

# launch self-host mode
npm run dapr
```

* ### Docker-Compose (for e2e)

```sh
# launch containers
docker-compose -f docker-compose.e2e.yml up
```

## Release

* ### Executable Binary

```sh
# compile TS to JS
npm run build
# (for Windows) pack assets into exe file
npm run release -- -t win
# (for Linux) pack assets into elf file
npm run release -- -t linux
```

* ### Docker Image

```sh
# build image with version tag
npm run dockerbuild
```

* ### Mock Server

maybe this is useful `@stoplight/prism-cli`
