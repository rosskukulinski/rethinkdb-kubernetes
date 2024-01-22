FROM golang:1.20-bookworm as probe

WORKDIR /go/src/probe

COPY go.mod go.sum ./
RUN go mod download

COPY probe.go .

RUN CGO_ENABLED=0 go install -trimpath -ldflags "-s -w"


FROM rethinkdb:2.4.4-bookworm-slim

LABEL maintainer="Marius André Elsfjordstrand Beck <marius.beck@nb.no>"

RUN apt-get update && \
    apt-get install -yq curl && \
    rm -rf /var/cache/apt/* && rm -rf /var/lib/apt/lists/*

ADD https://github.com/jqlang/jq/releases/download/jq-1.7.1/jq-linux-amd64 /usr/bin/jq
RUN chmod +x /usr/bin/jq

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

COPY --from=probe /go/bin/probe /rethinkdb-probe
COPY ./run.sh /
RUN chmod u+x /run.sh

ENTRYPOINT ["/usr/local/bin/dumb-init", "/run.sh"]
