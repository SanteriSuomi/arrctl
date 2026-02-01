import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config.js"
import { RadarrClient } from "../../../../lib/radarr/client.js"

export default class SettingsGeneralLogging extends Command {
	static description = "Logging settings"

	static examples = [
		"<%= config.bin %> radarr settings general logging --log-level debug",
		"<%= config.bin %> radarr settings general logging --log-level info --log-size-limit 2",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
		"log-level": Flags.string({
			description: "Log level",
			options: ["info", "debug", "trace"],
		}),
		"log-size-limit": Flags.integer({ description: "Maximum log file size in MB" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsGeneralLogging)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getHostConfig()

		const hasChanges = flags["log-level"] !== undefined || flags["log-size-limit"] !== undefined

		if (!hasChanges) {
			if (flags.json) {
				this.log(JSON.stringify(current, null, 2))
			} else {
				this.log("Use --help for usage information")
			}
			return
		}

		const updated = { ...current }

		if (flags["log-level"] !== undefined) {
			updated.logLevel = flags["log-level"] as typeof current.logLevel
		}
		if (flags["log-size-limit"] !== undefined) {
			updated.logSizeLimit = flags["log-size-limit"]
		}

		const result = await client.updateHostConfig(updated)

		if (flags.json) {
			this.log(JSON.stringify(result, null, 2))
		} else {
			this.log("✓ Logging settings updated")
		}
	}
}
