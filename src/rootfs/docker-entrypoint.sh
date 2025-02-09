#!/usr/bin/env sh
set -eu

# shellcheck disable=SC2120,SC3043
replaceEnvSecrets() {
	# replaceEnvSecrets 1.0.0
	# https://gist.github.com/anthochamp/d4d9537f52e5b6c42f0866dd823a605f
	local prefix="${1:-}"

	for envSecretName in $(export | awk '{print $2}' | grep -oE '^[^=]+' | grep '__FILE$'); do
		if [ -z "$prefix" ] || printf '%s' "$envSecretName" | grep "^$prefix" >/dev/null; then
			local envName
			envName=$(printf '%s' "$envSecretName" | sed 's/__FILE$//')

			local filePath
			filePath=$(eval echo '${'"$envSecretName"':-}')

			if [ -n "$filePath" ]; then
				if [ -f "$filePath" ]; then
					echo Using content from "$filePath" file for "$envName" environment variable value.

					export "$envName"="$(cat -A "$filePath")"
					unset "$envSecretName"
				else
					echo ERROR: Environment variable "$envSecretName" is defined but does not point to a regular file. 1>&2
					exit 1
				fi
			fi
		fi
	done
}

replaceEnvSecrets UNBOUND_

export UNBOUND_SERVER_VERBOSITY="${UNBOUND_SERVER_VERBOSITY:-}"
export UNBOUND_SERVER_EXTENDED_STATISTICS="${UNBOUND_SERVER_EXTENDED_STATISTICS:-}"
export UNBOUND_SERVER_LOG_QUERIES="${UNBOUND_SERVER_LOG_QUERIES:-}"
export UNBOUND_SERVER_LOG_REPLIES="${UNBOUND_SERVER_LOG_REPLIES:-}"
export UNBOUND_SERVER_LOG_LOCAL_ACTIONS="${UNBOUND_SERVER_LOG_LOCAL_ACTIONS:-}"
export UNBOUND_SERVER_LOG_SERVFAIL="${UNBOUND_SERVER_LOG_SERVFAIL:-}"
export UNBOUND_PRIVACY="${UNBOUND_PRIVACY:-}"
export UNBOUND_MSG_CACHE_SIZE="${UNBOUND_MSG_CACHE_SIZE:-}"
export UNBOUND_RRSET_CACHE_SIZE="${UNBOUND_RRSET_CACHE_SIZE:-}"
export UNBOUND_KEY_CACHE_SIZE="${UNBOUND_KEY_CACHE_SIZE:-}"
export UNBOUND_NEG_CACHE_SIZE="${UNBOUND_NEG_CACHE_SIZE:-}"

UNBOUND_CACHE_SIZE_HINT=${UNBOUND_CACHE_SIZE_HINT:-}

if [ -n "$UNBOUND_CACHE_SIZE_HINT" ]; then
	export UNBOUND_MSG_CACHE_SIZE="${UNBOUND_CACHE_SIZE_HINT}"m
	# https://unbound.docs.nlnetlabs.nl/en/latest/topics/core/performance.html#configuration
	export UNBOUND_RRSET_CACHE_SIZE=$((UNBOUND_CACHE_SIZE_HINT * 2))m

	export UNBOUND_KEY_CACHE_SIZE="${UNBOUND_CACHE_SIZE_HINT}"m
	export UNBOUND_NEG_CACHE_SIZE=$((UNBOUND_CACHE_SIZE_HINT / 4))m
fi

j2Templates="
/etc/unbound/unbound.conf
"

for file in $j2Templates; do
	jinja2 -o "$file" "$file.j2"

	# can't use --reference with alpine
	chmod "$(stat -c '%a' "$file.j2")" "$file"
	chown "$(stat -c '%U:%G' "$file.j2")" "$file"
done

# update dynamic config owner/group in case it is mounted
chown -R unbound:root /etc/unbound/unbound.conf.d

# update the trust anchor if necessary
unbound-anchor -a "/usr/share/dnssec-root/trusted-key.key"

exec "$@"
