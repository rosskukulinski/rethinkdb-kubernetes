H:=$(shell git rev-parse --short HEAD)
I=tjmehta/rethinkdb-kubernetes
T=2.4.1-$H

build:
	docker build ./ -t $I:$T

build-no-cache:
	docker build --no-cache ./ -t $I:$T

dev-clear-cache:
	deno cache --unstable --reload ./findPeersSrc/findPeers.ts
	deno cache --reload livenessProbe.ts
	deno cache --reload startupProbe.ts

dev-build-findPeers:
	deno bundle --unstable ./findPeersSrc/findPeers.ts -- findPeers.js
	deno compile --allow-env --allow-net --allow-read findPeers.js -- findPeers
dev-build-run-findPeers: dev-build-findPeers
	KUBERNETES_SERVICE_PROTOCOL=http KUBERNETES_SERVICE_HOST=localhost KUBERNETES_SERVICE_PORT=3003 KUBERNETES_SERVICE_TOKEN_PATH=/Users/tjmehta/Developer/@tjmehta/rethinkdb-kubernetes/findPeersSrc/mocks/mockToken KUBERNETES_SERVICE_CERT_PATH=foo ./findPeers

dev-build-readinessProbe:
	deno bundle readinessProbe.ts -- readinessProbe.js
	deno compile --allow-env --allow-net readinessProbe.js -- readinessProbe
dev-build-run-readinessProbe: dev-build-readinessProbe
	RETHINK_HOST=nas.local RETHINK_PORT=8000 ./readinessProbe

dev-build-livenessProbe:
	deno bundle livenessProbe.ts -- livenessProbe.js
	deno compile --allow-env --allow-net livenessProbe.js -- livenessProbe
dev-build-run-livenessProbe: dev-build-livenessProbe
	RETHINK_HOST=nas.local ./livenessProbe

dev-build-startupProbe:
	deno bundle startupProbe.ts -- startupProbe.js
	deno compile --allow-env --allow-net startupProbe.js -- startupProbe
dev-build-run-startupProbe: dev-build-startupProbe
	RETHINK_HOST=nas.local ./startupProbe
