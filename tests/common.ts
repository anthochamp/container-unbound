import * as path from "node:path";

import type { DockerContainerRunOptions } from "@ac-kit/cmd-docker";
import { initDockerSuite } from "@ac-kit/integration-test-util";
import { beforeAll } from "vitest";

const srcPath = path.resolve(path.join(__dirname, "..", "src"));

type ContainerRunOptions = Omit<DockerContainerRunOptions, "name" | "context" | "detach">;

export function initSuite() {
	let pendingRunOptions: ContainerRunOptions = {};

	const { containerImageName } = initDockerSuite(srcPath, {
		containerNamePrefix: "test-unbound-",
		containerRunOptions: () => pendingRunOptions,
	});

	return {
		containerImageName,
		/** Registers the container's run options for every test in this describe. */
		useContainer: (runOptions: ContainerRunOptions): void => {
			beforeAll(() => {
				pendingRunOptions = runOptions;
			});
		},
	};
}
