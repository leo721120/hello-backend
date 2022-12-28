# io/backend

Template for backend service.

## Prerequisite

* [node.js](https://nodejs.org/en/)
* [Docker](https://docs.docker.com/)
* [Dapr](https://dapr.io/)
* [Gherkin](https://cucumber.io/docs/gherkin/)

## Develop

```sh
# install all dependencies
npm i
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
