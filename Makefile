IMAGE=rosskukulinski/rethinkdb-kubernetes
TAG=2.3.5-v2

all: push

probe:
	(cd ./rethinkdb-probe && ./build-probe.sh)

image: probe
	docker build -t ${IMAGE}:${TAG} .

push: image
	docker push ${IMAGE}:${TAG}
