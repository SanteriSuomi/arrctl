import { Flags } from "@oclif/core"
import { BaseSettingsCommand } from "../../../../lib/base-command"
import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class SettingsGeneralLogging extends BaseSettingsCommand {
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
			this.outputNoChanges(current, flags.json)
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

		this.outputResult(result, "✓ Logging settings updated", flags.json)
	}
}
