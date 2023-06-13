# io/backend

Template for backend service.

## Prerequisite

* [node.js](https://nodejs.org/en/)
  * runtime
* [Docker](https://docs.docker.com/)
* [husky](https://www.npmjs.com/package/husky)
  * used to auto check commit
* [Gherkin](https://cucumber.io/docs/gherkin/)
  * used to describe use case for testing
* [CMake](https://cmake.org/)
  * Windows
    * [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/zh-hant/visual-cpp-build-tools/)
    * [vcpkg](https://vcpkg.io/en/getting-started.html)
  * Unix
    * GCC

## Develop

```sh
#
cd <vcpkg>

# (for Windows) install c++ dependencies for addon
./vcpkg install boost:x64-windows-static

```

```powershell
# forward localhost traffic to WSL docker daemon
netsh interface portproxy add v4tov4 listenport=2375 listenaddress=0.0.0.0 connectport=2375 connectaddress=[WSL_IP]

# show forwarding rules
netsh interface portproxy show v4tov4
```

```sh
# install all (dev)dependencies
npm i

# compile WASM
npm run wasm

# compile c++ addon
npm run cmake -- rebuild

# run test
npm test

# (optional) launch containers for develop (db, mq, ...)
docker-compose -f docker-compose.dev.yml up

# (optional) launch mock service if you don't have real service
npm run mock/apphub
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

```sh
# compile apidoc from openapi
npm run redoc

# compile TS to JS (something may report error, but it's ok)
npm run build

# (for Windows) pack assets into exe file
npm run release -- -t win

# (for Linux) pack assets into elf file
npm run release -- -t linux

# (for Docker) build image with version tag
npm run dockerbuild

# clean up
npm run clean
```
