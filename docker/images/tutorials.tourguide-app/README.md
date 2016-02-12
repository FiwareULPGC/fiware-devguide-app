## FIWARE Developers Guide App - Docker image

[FIWARE Developers Guide App](https://github.com/Fiware/tutorials.TourGuide-App) is the sample application used in the [FIWARE Developers Guide](http://www.fiware.org/tour-guide/) to show real code working with the Generic Enablers integrated.

This image is intended to work together with [Orion](https://registry.hub.docker.com/u/bitergia/fiware-orion/).

## Image contents

- [x] `ubuntu:14.04` baseimage available [here](https://hub.docker.com/_/ubuntu/)
- [x] Node.js
- [x] REST interface for working with Orion

## Usage

We strongly suggest you to use [docker-compose](https://docs.docker.com/compose/). With docker compose you can define multiple containers in a single file, and link them easily.

So for this purpose, we have already a simple file that launches:

   * A MongoDB image with pre-loaded data
   * Orion Context Broker as a service
   * IDM Keyrock
   * PEP Proxy
   * Authzforce
   * IDAS
   * Cygnus
   * TourGuide app

The file `docker-compose.yml` can be downloaded from [here](https://raw.githubusercontent.com/Fiware/tutorials.TourGuide-App/master/docker/compose/docker-compose.yml).

Once you get it, you just have to pull the images:
```
docker-compose pull
```
And then start the containers:
```
docker-compose up -d
```

Note that even though the `docker-compose up -d` does also pull the images, we suggest to do it separately to avoid synchronization issues.

Also, there are several enviroment variables that you can configure in the [docker-compose.yml](https://raw.githubusercontent.com/Fiware/tutorials.TourGuide-App/master/docker/compose/docker-compose.yml):

   * `ORION_HOSTNAME`. Hostname of the Orion application protected by a proxy. By default the value is `pepwilma`
   * `ORION_NO_PROXY_HOSTNAME`. Hostname of the Orion application without proxy. By default the value is `orion`
   * `ORION_PORT`. Port of the Orion application. By default the value is `1026`
   * `ORION_PEP_ENABLED`. Activate the PEP Proxy. By default the value is `true`
   * `IDAS_PORT`. Port of the IDAS application. By default the value is `8080`
   * `SENSORS_GENERATION_ENABLED`. Enables sensors generation for each restaurant. By default the value is `false`.
   * `ORION_SUBSCRIPTIONS_ENABLED`. Activates the Orion sensors subscription, updating the Restaurant information. By default the value is `false`. **Note**: `SENSORS_GENERATION_ENABLED` must be set to `true`, otherwise there won't be sensors and no data will be generated.
   * `SENSORS_FORCED_UPDATE_ENABLED`. Updates the values of the sensors. By default the value is `false`. **Note**: `SENSORS_GENERATION_ENABLED` must be set to `true`, otherwise there won't be sensors and no data will be generated.

And all the services will be up. End to end testing can be done using the REST interface. And example application is [the restaurant data feeder](https://github.com/Fiware/tutorials.TourGuide-App/blob/master/server/restaurant_feeder.js).

**Note**: as retrieving the `<container-ip>` for TourGuide and orion containers can be a bit 'tricky', we've created a set of utilities and useful scripts for handling docker images. You can find them all [here](https://github.com/Bitergia/docker/tree/master/utils).

## What if I don't want to use docker-compose?

No problem, the only thing is that you will have to deploy an Orion container yourself and configure its IP as Orion name inside the TourGuide container.

### Logs and other commands ###

By default, TourGuide show the logs from apache via `docker logs <container-id>` command.

If you need to run another command in the same container, you can use the `docker exec` command.

## User feedback

### Documentation

All the information regarding the image generation is hosted publicly on [Github](https://github.com/Fiware/tutorials.TourGuide-App/tree/master/docker/images/tutorials.TourGuide-App).

### Issues

If you find any issue with this image, feel free to contact us via [Github issue tracking system](https://github.com/Fiware/tutorials.TourGuide-App/issues).