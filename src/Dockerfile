FROM alpine:3.23.3@sha256:25109184c71bdad752c8312a8623239686a9a2071e8825f20acb8f2198c3f659 AS builder

# hadolint ignore=DL3018
RUN apk add --no-cache build-base openssl-dev expat-dev libevent-dev nghttp2-dev

# renovate: datasource=github-releases depName=NLnetLabs/unbound extractVersion=^release-(?<version>.+)$
ARG UNBOUND_VERSION=1.24.2

# hadolint ignore=DL3003
RUN set -ex; \
	wget -q "https://nlnetlabs.nl/downloads/unbound/unbound-${UNBOUND_VERSION}.tar.gz" -O /tmp/unbound.tar.gz; \
	tar xzf /tmp/unbound.tar.gz -C /tmp; \
	cd "/tmp/unbound-${UNBOUND_VERSION}"; \
	./configure \
	--prefix=/usr \
	--sysconfdir=/etc \
	--disable-rpath \
	--with-libevent \
	--with-libnghttp2; \
	make -j"$(nproc)"; \
	make install

FROM alpine:3.23.3@sha256:25109184c71bdad752c8312a8623239686a9a2071e8825f20acb8f2198c3f659

# hadolint ignore=DL3018
RUN set -ex; \
	apk add --update --no-cache jinja2-cli bind-tools openssl expat libevent nghttp2-libs; \
	addgroup -S unbound; \
	adduser -S -H -h /etc/unbound -s /sbin/nologin -G unbound unbound

COPY --from=builder /usr/sbin/unbound /usr/sbin/unbound
COPY --from=builder /usr/sbin/unbound-* /usr/sbin/
COPY --from=builder /usr/lib/libunbound.so* /usr/lib/

COPY /rootfs/unbound.conf.j2 /etc/unbound/

RUN set -ex; \
	mkdir -p /etc/unbound/unbound.conf.d; \
	mkdir -p /usr/share/dnssec-root

COPY --chmod=775 /rootfs/docker-entrypoint.sh /

EXPOSE 53/udp 53/tcp

ENTRYPOINT [ "/docker-entrypoint.sh" ]

CMD [ "/usr/sbin/unbound", "-d" ]

#VOLUME [ "/etc/unbound/unbound.conf.d" ]

HEALTHCHECK \
	CMD dig @127.0.0.1 || exit 1
