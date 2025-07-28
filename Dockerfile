FROM node:22-bookworm-slim AS builder

RUN mkdir -p /opt && \
    apt-get update && \
    apt-get -y --no-install-recommends --no-install-suggests install \
        ca-certificates \
        cmake \
        g++ \
        gcc \
        git \
        libboost1.81-all-dev \
        libbz2-dev \
        liblua5.4-dev \
        libtbb-dev \
        libxml2-dev \
        libzip-dev \
        lua5.4 \
        make \
        pkg-config

# OSRM backend setting
COPY ./osrm-backend /osrm-backend
WORKDIR /osrm-backend

# install nodejs dependencies
RUN yarn install --ignore-scripts --unsafe-perm

RUN NPROC=2 && \
    git show --format="%H" | head -n1 > /opt/OSRM_GITSHA && \
    echo "Building OSRM gitsha $(cat /opt/OSRM_GITSHA)" && \
    mkdir -p build && \
    cd build && \
    BUILD_TYPE="Release" && \
    ENABLE_ASSERTIONS="Off" && \
    BUILD_TOOLS="Off" && \
    export CXXFLAGS="-Wno-array-bounds -Wno-uninitialized -Wno-stringop-overflow" && \
    echo "Building ${BUILD_TYPE} with ENABLE_ASSERTIONS=${ENABLE_ASSERTIONS}" && \
    cmake .. -DCMAKE_BUILD_TYPE=${BUILD_TYPE} -DENABLE_ASSERTIONS=${ENABLE_ASSERTIONS} -DBUILD_TOOLS=${BUILD_TOOLS} -DENABLE_LTO=On -DENABLE_NODE_BINDINGS=ON \
    -DCMAKE_RULE_MESSAGES:BOOL=OFF -DCMAKE_VERBOSE_MAKEFILE:BOOL=OFF && \
    make -j${NPROC} install && \
    cd ../profiles && \
    cp -r * /opt && \
    # strip /usr/local/bin/* && \
    rm -rf /src

# Multistage build to reduce image size - https://docs.docker.com/build/building/multi-stage/#use-multi-stage-builds
# Only the content below ends up in the image, this helps remove /src from the image (which is large)
FROM debian:bookworm-slim AS runstage


COPY --from=builder /usr/local /usr/local
COPY --from=builder /osrm-backend/lib /osrm-backend/lib
COPY --from=builder /opt /opt

RUN apt-get update && \
    apt-get install -y --no-install-recommends --no-install-suggests \
        expat \
        libboost-date-time1.81.0 \
        libboost-iostreams1.81.0 \
        libboost-program-options1.81.0 \
        libboost-thread1.81.0 \
        liblua5.4-0 \
        libtbb12 && \
    rm -rf /var/lib/apt/lists/* && \
# Add /usr/local/lib to ldconfig to allow loading libraries from there
    ldconfig /usr/local/lib


COPY ./osrm-node-api /osrm-node-api
COPY ./osrm-data /osrm-data

ENV DATASET_NAME=NAME_MONACO \
    SHARED_MEMORY=false \
    WORKER_THREADS=2 \
    LIBUV_THREADS=2 \
    KEEPALIVE=true \
    MAX_LOCATIONS_DISTANCE_TABLE=1000 \
    MAX_ALTERNATIVES=3 \
    MAX_RESULTS_NEAREST=10 \
    SERVICE_PORT=8080 \
    MONITOR_PORT=9090 \
    TZ="Asia/Singapore" 

WORKDIR /osrm-node-api
RUN cp /osrm-node-api/backend_version_patch/index.js /osrm-backend/lib/

EXPOSE 8080
EXPOSE 9090

RUN yarn install
# ENTRYPOINT ["yarn", "start"]