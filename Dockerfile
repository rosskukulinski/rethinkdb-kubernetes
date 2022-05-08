FROM denoland/deno:1.10.3 as build_readiness_probe
MAINTAINER Tejesh Mehta <@tjmehta>

# Build container to have a consistent go build environment

WORKDIR /tmp

ADD readinessProbe.ts /tmp/readinessProbe.ts

RUN deno bundle readinessProbe.ts -- readinessProbe.js
RUN deno compile --allow-env --allow-net readinessProbe.js -- readinessProbe

############################################

FROM denoland/deno:1.10.3 as build_liveness_probe
MAINTAINER Tejesh Mehta <@tjmehta>

# Build container to have a consistent go build environment

WORKDIR /tmp

ADD livenessProbe.ts /tmp/livenessProbe.ts

RUN deno bundle livenessProbe.ts -- livenessProbe.js
RUN deno compile --allow-env --allow-net livenessProbe.js -- livenessProbe

############################################

FROM denoland/deno:1.10.3 as build_startup_probe
MAINTAINER Tejesh Mehta <@tjmehta>

# Build container to have a consistent go build environment

WORKDIR /tmp

ADD startupProbe.ts /tmp/startupProbe.ts

RUN deno bundle startupProbe.ts -- startupProbe.js
RUN deno compile --allow-env --allow-net startupProbe.js -- startupProbe

############################################

FROM denoland/deno:1.19.0 as build_findPeers
MAINTAINER Tejesh Mehta <@tjmehta>

# Build container to have a consistent go build environment

WORKDIR /tmp

ADD findPeersSrc/ /tmp/findPeersSrc

RUN deno bundle --unstable ./findPeersSrc/findPeers.ts -- findPeers.js
RUN deno compile --allow-env --allow-net --allow-read findPeers.js -- findPeers

############################################

FROM rethinkdb:2.4.1

MAINTAINER Tejesh Mehta <@tjmehta>

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

COPY --from=build_findPeers /tmp/findPeers ./findPeers
COPY --from=build_liveness_probe /tmp/livenessProbe ./livenessProbe
COPY --from=build_startup_probe /tmp/startupProbe ./startupProbe
RUN chmod u+x ./findPeers ./livenessProbe ./startupProbe

ENTRYPOINT ["/usr/local/bin/dumb-init", "/run.sh"]
