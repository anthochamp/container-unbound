FROM alpine:3.23.0@sha256:51183f2cfa6320055da30872f211093f9ff1d3cf06f39a0bdb212314c5dc7375

# hadolint ignore=DL3018
RUN apk add --update --no-cache jinja2-cli unbound bind-tools

COPY /rootfs/unbound.conf.j2 /etc/unbound/unbound.conf.j2

RUN mkdir -p /etc/unbound/unbound.conf.d

COPY --chmod=775 /rootfs/docker-entrypoint.sh /docker-entrypoint.sh

EXPOSE 53/udp 53/tcp

ENTRYPOINT [ "/docker-entrypoint.sh" ]

CMD [ "/usr/sbin/unbound", "-d" ]

#VOLUME [ "/etc/unbound/unbound.conf.d" ]

HEALTHCHECK \
	CMD dig @127.0.0.1 || exit 1
