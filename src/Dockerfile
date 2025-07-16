FROM alpine:3.22.1@sha256:4bcff63911fcb4448bd4fdacec207030997caf25e9bea4045fa6c8c44de311d1

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
