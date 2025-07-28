# OSRM NodeJS Server

A high-performance NodeJS server implementation for the Open Source Routing Machine (OSRM) backend. This server provides a RESTful API for routing services with built-in metrics, logging, and clustering capabilities.

## Features

- Built on Express.js framework
- Multi-threading support with Node.js cluster module
- Automatic load balancing across worker threads
- Prometheus metrics integration
- Winston-based logging with daily rotation
- Security enhancements with Helmet
- FlatBuffers support for efficient serialization

## Prerequisites

- Node.js >= 22.0.0
- OSRM backend library

## Environment Variables

- `LIBUV_THREADS`: Number of threads in the libuv threadpool
- `WORKER_THREADS`: Number of worker processes (defaults to 2 if not set)

# Running the Server with Docker
## Preparation
```bash
# Setting up the main working directory
mkdir osrm-service && cd osrm-service
# Create data folder
mkdir -p osrm-data
# Clone osrm-backend
git clone https://github.com/Project-OSRM/osrm-backend.git
# Clone this repo
git clone https://github.com/juchengquan/osrm-node-api.git
# Create soft links
ln -s ./osrm-node-api/Makefile ./
ln -s ./osrm-node-api/ ./
```

## Building the Docker Image
```bash
IMAGE_NAME=<YOUR_IMAGE_NAME> TAG=<YOUR_TAG_NAME> \
    make build .
```
## (Optional) OSM Data Preprataion

Take Monaco data as example (following [using-docker](https://github.com/Project-OSRM/osrm-backend?tab=readme-ov-file#using-docker)):
```bash
# Download Monaco data
wget https://download.geofabrik.de/europe/monaco-latest.osm.pbf -O ./osrm-data/monaco.osm.pbf
# 
export IMAGE_NAME=<YOUR_IMAGE_NAME>
export TAG=<YOUR_TAG_NAME>
# osrm-extract:
FILE_NAME=monaco make extract 
# MLD: osrm-partition + osrm-customize
FILE_NAME=monaco make partition && FILE_NAME=monaco make customize
# CH: osrm-contract
FILE_NAME=monaco make contract
```

## Run the Docker instance
```bash
IMAGE_NAME=<YOUR_IMAGE_NAME> TAG=<YOUR_TAG_NAME> \
OSRM_ALGORITHM=CH FILE_NAME=monaco \
    make run 
```


## Contributing

Feel free to submit a Pull Request.

## License

MIT