import { Resolver } from "node:dns/promises";
import { expect, suite, test, vi } from "vitest";
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

suite.sequential("dns", () => {
	const { startContainer } = initSuite();

	test("resolves domain names with default configuration", async () => {
		const { udpPort } = await startContainer();

		await vi.waitUntil(() => isDnsReady(udpPort), {
			timeout: 30_000,
			interval: 1000,
		});

		const resolver = new Resolver();
		resolver.setServers([`127.0.0.1:${udpPort}`]);
		const addresses = await resolver.resolve4("example.com");

		expect(addresses.length).toBeGreaterThan(0);
	});

	test("resolves domain names with UNBOUND_CACHE_SIZE_HINT set", async () => {
		const { udpPort } = await startContainer({
			env: { UNBOUND_CACHE_SIZE_HINT: "64" },
		});

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
