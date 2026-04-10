import { randomBytes } from "node:crypto";
import * as path from "node:path";
import {
	dockerBuildxBuild,
	dockerContainerRm,
	dockerContextShow,
	dockerContextUse,
	dockerImageRm,
} from "@ac-essentials/cli";
import {
	type EnvVariables,
	escapeCommandArg,
	execAsync,
	getRandomEphemeralPort,
} from "@ac-essentials/misc-util";
import { afterAll, afterEach, beforeAll } from "vitest";

const srcPath = path.resolve(path.join(__dirname, "..", "src"));

export const docker = (cmd: string) =>
	execAsync(`docker --context default ${cmd}`, { encoding: "utf-8" });

type StartContainerOptions = {
	env?: EnvVariables;
};

export function initSuite() {
	let initialContext: string;
	const containerName = `test-unbound-${randomBytes(8).toString("hex")}`;
	const containerImageName = `${containerName}-img`;

	async function stopContainer() {
		try {
			await dockerContainerRm([containerName], { force: true });
		} catch (_) {}
	}

	beforeAll(async () => {
		initialContext = await dockerContextShow();
		await dockerContextUse("default");

		await stopContainer();

		try {
			await dockerImageRm([containerImageName], { force: true });
		} catch (_) {}

		await dockerBuildxBuild(srcPath, { tags: [containerImageName] });
	});

	afterAll(async () => {
		try {
			await dockerImageRm([containerImageName], { force: true });
		} catch (_) {}
		try {
			await dockerContextUse(initialContext);
		} catch (_) {}
	});

	afterEach(async () => {
		await stopContainer();
	});

	return {
		startContainer: async (options?: StartContainerOptions) => {
			const udpPort = getRandomEphemeralPort();

			const envArgs = Object.entries(options?.env ?? {})
				.map(([k, v]) => `-e ${escapeCommandArg(`${k}=${v}`)}`)
				.join(" ");

			await docker(
				`run -d --name ${containerName} -p ${udpPort}:53/udp ${envArgs} ${containerImageName}`,
			);

			return { udpPort };
		},
		containerName,
		containerImageName,
	};
}
