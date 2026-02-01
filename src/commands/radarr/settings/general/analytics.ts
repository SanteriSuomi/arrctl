import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config.js"
import { RadarrClient } from "../../../../lib/radarr/client.js"

export default class SettingsGeneralAnalytics extends Command {
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
			if (flags.json) {
				this.log(JSON.stringify(current, null, 2))
			} else {
				this.log("Use --help for usage information")
			}
			return
		}

		const updated = { ...current }

		if (flags.enabled !== undefined) {
			updated.analyticsEnabled = flags.enabled
		}

		const result = await client.updateHostConfig(updated)

		if (flags.json) {
			this.log(JSON.stringify(result, null, 2))
		} else {
			this.log("✓ Analytics settings updated (restart required)")
		}
	}
}
