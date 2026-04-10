# Unbound Container

![GitHub License](https://img.shields.io/github/license/anthochamp/container-unbound?style=for-the-badge)
![GitHub Release](https://img.shields.io/github/v/release/anthochamp/container-unbound?style=for-the-badge&color=457EC4)
![GitHub Release Date](https://img.shields.io/github/release-date/anthochamp/container-unbound?style=for-the-badge&display_date=published_at&color=457EC4)

Container images based on [Unbound](https://nlnetlabs.nl/projects/unbound/), a validating, recursive, and caching DNS resolver with DNSSEC support.

## How to use this image

```shell
docker run -d \
  -p 53:53/udp \
  -p 53:53/tcp \
  anthochamp/unbound
```

## Volumes

- `/etc/unbound/unbound.conf.d/` — Drop-in configuration directory. Any `.conf` file placed here is included automatically and can override defaults or add custom zones, forward zones, stub zones, etc.

## Ports

| Port | Protocol | Description        |
|------|----------|--------------------|
| 53   | UDP      | DNS queries        |
| 53   | TCP      | DNS queries (TCP)  |

## Configuration

Volumes and environment variables may be combined. Sensitive values may be loaded from files by appending `__FILE` to any supported `UNBOUND_`-prefixed variable.

### Logging

#### UNBOUND_SERVER_VERBOSITY

**Default**: *empty* (Unbound default: `1`)

Verbosity level for logging. See [Unbound documentation](https://unbound.docs.nlnetlabs.nl/en/latest/manpages/unbound.conf.html) for values (`0`–`5`).

#### UNBOUND_SERVER_EXTENDED_STATISTICS

**Default**: *empty* (Unbound default: `no`)

Set to `yes` to enable per-query-type statistics in `unbound-control stats`. Required for Prometheus metrics via the unbound-exporter container.

#### UNBOUND_SERVER_LOG_QUERIES

**Default**: *empty* (Unbound default: `no`)

Set to `yes` to log one line per incoming query (time, IP, name, type, class).

#### UNBOUND_SERVER_LOG_REPLIES

**Default**: *empty* (Unbound default: `no`)

Set to `yes` to log one line per reply (time, IP, name, type, class, rcode, resolution time, from-cache, response size).

#### UNBOUND_SERVER_LOG_LOCAL_ACTIONS

**Default**: *empty* (Unbound default: `no`)

Set to `yes` to log local-zone actions.

#### UNBOUND_SERVER_LOG_SERVFAIL

**Default**: *empty* (Unbound default: `no`)

Set to `yes` to log the reason why queries return SERVFAIL.

### Privacy

#### UNBOUND_PRIVACY

**Default**: *empty* (Unbound default: `no`)

Set to `yes` to hide server identity and version from DNS queries (`hide-identity`, `hide-version`, `hide-trustanchor`, `hide-http-user-agent`).

### Cache sizes

All cache size values accept Unbound's byte notation: plain bytes, or with `k`, `m`, `G` suffix (e.g. `64m`).

Refer to the [Unbound performance tuning guide](https://unbound.docs.nlnetlabs.nl/en/latest/topics/core/performance.html#configuration) for recommended values.

#### UNBOUND_MSG_CACHE_SIZE

**Default**: *empty* (Unbound default: `4m`)

Size of the DNS message cache.

#### UNBOUND_RRSET_CACHE_SIZE

**Default**: *empty* (Unbound default: `4m`)

Size of the RRset cache. The Unbound performance guide recommends setting this to twice `msg-cache-size`.

#### UNBOUND_KEY_CACHE_SIZE

**Default**: *empty* (Unbound default: `4m`)

Size of the DNSSEC key cache.

#### UNBOUND_NEG_CACHE_SIZE

**Default**: *empty* (Unbound default: `1m`)

Size of the negative response cache (NXDOMAIN answers).

#### UNBOUND_CACHE_SIZE_HINT

**Default**: *empty*

Convenience shortcut expressed in **MiB**. When set, overrides all four cache sizes using the following proportions (based on the [Unbound performance guide](https://unbound.docs.nlnetlabs.nl/en/latest/topics/core/performance.html#configuration)):

| Variable                  | Value                              |
|---------------------------|------------------------------------|
| `UNBOUND_MSG_CACHE_SIZE`  | `<hint>m`                          |
| `UNBOUND_RRSET_CACHE_SIZE`| `<hint * 2>m`                      |
| `UNBOUND_KEY_CACHE_SIZE`  | `<hint>m`                          |
| `UNBOUND_NEG_CACHE_SIZE`  | `<hint / 4>m`                      |

Example: `UNBOUND_CACHE_SIZE_HINT=64` sets msg+key cache to 64 MB, rrset cache to 128 MB, neg cache to 16 MB.

## Example Docker Compose

```yaml
services:
  unbound:
    image: anthochamp/unbound
    ports:
      - "53:53/udp"
      - "53:53/tcp"
    volumes:
      - ./unbound.conf.d:/etc/unbound/unbound.conf.d
    environment:
      UNBOUND_PRIVACY: "yes"
      UNBOUND_SERVER_EXTENDED_STATISTICS: "yes"
      UNBOUND_CACHE_SIZE_HINT: "64"
```

## References

- [Unbound documentation](https://unbound.docs.nlnetlabs.nl/)
- [unbound.conf man page](https://unbound.docs.nlnetlabs.nl/en/latest/manpages/unbound.conf.html)
- [Unbound performance tuning](https://unbound.docs.nlnetlabs.nl/en/latest/topics/core/performance.html)
