build:
	docker build -t $(IMAGE_NAME):$(TAG) -f ./Dockerfile .

extract:
	docker run -t -v "${PWD}/osrm-data:/osrm-data" \
	$(IMAGE_NAME):$(TAG) \
	osrm-extract -p /opt/car.lua \
	/osrm-data/$(FILE_NAME).osm.pbf || echo "osrm-extract failed"

# CH
contract:
	docker run -t -v "${PWD}/osrm-data:/osrm-data" \
	$(IMAGE_NAME):$(TAG) \
	osrm-contract /osrm-data/$(FILE_NAME).osrm || echo "osrm-contract failed"

# MLD
partition:
	docker run -t -v "${PWD}/osrm-data:/osrm-data" \
	$(IMAGE_NAME):$(TAG) \
	osrm-partition /osrm-data/$(FILE_NAME).osrm || echo "osrm-partition failed"

# MLD
customize:
	docker run -t -v "${PWD}/osrm-data:/osrm-data" \
	$(IMAGE_NAME):$(TAG) \
	osrm-customize /osrm-data/$(FILE_NAME).osrm || echo "osrm-customize failed"

run:
	docker run -it --rm \
		-v "${PWD}/osrm-data:/osrm-data" \
		-p 5555:5000 \
		-p 8080:8080 \
		-p 9090:9090 \
		--memory=8g \
		--ulimit memlock=-1:-1 \
		--memory-swap=-1 \
		--name route_engine \
		--cpus 2 \
		-e WORKER_THREADS=2 -e LIBUV_THREADS=2 \
		-e OSRM_GRAPH=/osrm-data/$(FILE_NAME).osrm \
		-e OSRM_ALGORITHM=$(OSRM_ALGORITHM) \
		--privileged \
		$(IMAGE_NAME):$(TAG) \
		yarn start
