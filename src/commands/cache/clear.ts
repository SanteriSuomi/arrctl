import { Args, Command } from "@oclif/core"

import { configCache } from "../../lib/cache"

export default class CacheClear extends Command {
	static args = {
		service: Args.string({
			description: "Service to clear cache for (radarr, sonarr)",
			required: false,
		}),
	}

	static description = "Clear cached API defaults"

	static examples = [
		"<%= config.bin %> cache clear",
		"<%= config.bin %> cache clear radarr",
		"<%= config.bin %> cache clear sonarr",
	]

	async run(): Promise<void> {
		const { args } = await this.parse(CacheClear)

		configCache.clear(args.service)

		if (args.service) {
			this.log(`✓ Cleared cache for ${args.service}`)
		} else {
			this.log("✓ Cleared all caches")
		}
	}
}
