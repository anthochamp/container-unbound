import { Resolver } from "node:dns/promises";

import { getRandomEphemeralPort } from "@ac-kit/core";
import { expect, describe, it, vi } from "vitest";

import { initSuite } from "./common";

async function isDnsReady(port: number): Promise<boolean> {
	const resolver = new Resolver();
	resolver.setServers([`127.0.0.1:${port}`]);

	try {
		await resolver.resolve4("example.com");
		return true;
	} catch {
		return false;
	}
}

describe("dns", () => {
	const { useContainer } = initSuite();

	describe("default configuration", () => {
		const udpPort = getRandomEphemeralPort();
		useContainer({ publish: [`${udpPort}:53/udp`] });

		it("resolves domain names", async () => {
			await vi.waitUntil(() => isDnsReady(udpPort), {
				timeout: 30_000,
				interval: 1000,
			});

			const resolver = new Resolver();
			resolver.setServers([`127.0.0.1:${udpPort}`]);
			const addresses = await resolver.resolve4("example.com");

			expect(addresses.length).toBeGreaterThan(0);
		});
	});

	describe("UNBOUND_CACHE_SIZE_HINT set", () => {
		const udpPort = getRandomEphemeralPort();
		useContainer({
			publish: [`${udpPort}:53/udp`],
			env: { UNBOUND_CACHE_SIZE_HINT: "64" },
		});

		it("resolves domain names", async () => {
			await vi.waitUntil(() => isDnsReady(udpPort), {
				timeout: 30_000,
				interval: 1000,
			});

			const resolver = new Resolver();
			resolver.setServers([`127.0.0.1:${udpPort}`]);
			const addresses = await resolver.resolve4("example.com");

			expect(addresses.length).toBeGreaterThan(0);
		});
	});
});
