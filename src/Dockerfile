FROM alpine:3.23.3@sha256:25109184c71bdad752c8312a8623239686a9a2071e8825f20acb8f2198c3f659

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
