import { Flags } from "@oclif/core"
import { BaseSettingsCommand } from "../../../../lib/base-command.js"
import { requireConfig } from "../../../../lib/config.js"
import { RadarrClient } from "../../../../lib/radarr/client.js"

export default class SettingsGeneralAnalytics extends BaseSettingsCommand {
	static description = "Analytics settings"

	static examples = [
		"<%= config.bin %> radarr settings general analytics --enabled",
		"<%= config.bin %> radarr settings general analytics --no-enabled",
	]

	static flags = {
		enabled: Flags.boolean({ description: "Send anonymous usage data", allowNo: true }),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsGeneralAnalytics)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getHostConfig()

		const hasChanges = flags.enabled !== undefined

		if (!hasChanges) {
			this.outputNoChanges(current, flags.json)
			return
		}

		const updated = { ...current }

		if (flags.enabled !== undefined) {
			updated.analyticsEnabled = flags.enabled
		}

		const result = await client.updateHostConfig(updated)

		this.outputResult(result, "✓ Analytics settings updated (restart required)", flags.json)
	}
}
