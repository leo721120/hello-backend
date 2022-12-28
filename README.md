# io/backend

Template for backend service.

## Prerequisite

* [node.js](https://nodejs.org/en/)
* [Docker](https://docs.docker.com/)
* [Dapr](https://dapr.io/)
* [Gherkin](https://cucumber.io/docs/gherkin/)
* [CMake](https://cmake.org/)
  * Windows
    * [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/zh-hant/visual-cpp-build-tools/)
  * Unix
    * GCC

## Develop

```sh
# install all dependencies
npm i

# (only for Windows) compile c++ addon to VS2019
npm config set msvs_version 2019

# compile c++ addon
npm run cmake -- rebuild
```

There are 2 way to launch **Dapr** environment.

### Self-Host (for develop)

```sh
# launch self-host mode
npm run dapr
```

### Docker-Compose (for e2e)

```sh
# rebuild image if need
docker build --no-cache .

# launch
docker-compose up
```
