FROM alpine:3.21.3@sha256:a8560b36e8b8210634f77d9f7f9efd7ffa463e380b75e2e74aff4511df3ef88c

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
