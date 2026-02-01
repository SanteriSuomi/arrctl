import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config.js"
import { RadarrClient } from "../../../../lib/radarr/client.js"

export default class SettingsDownloadClientsCompleted extends Command {
	static description = "Completed download handling settings"

	static examples = [
		"<%= config.bin %> radarr settings downloadclients completed --enable",
		"<%= config.bin %> radarr settings downloadclients completed --check-interval 2",
	]

	static flags = {
		"check-interval": Flags.integer({
			description: "Check for finished downloads interval in minutes",
		}),
		enable: Flags.boolean({
			description: "Enable completed download handling",
			allowNo: true,
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsDownloadClientsCompleted)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getDownloadClientConfig()

		const hasChanges = flags.enable !== undefined || flags["check-interval"] !== undefined

		if (!hasChanges) {
			if (flags.json) {
				this.log(JSON.stringify(current, null, 2))
			} else {
				this.log("Use --help for usage information")
			}
			return
		}

		const updated = { ...current }

		if (flags.enable !== undefined) {
			updated.enableCompletedDownloadHandling = flags.enable
		}
		if (flags["check-interval"] !== undefined) {
			updated.checkForFinishedDownloadInterval = flags["check-interval"]
		}

		const result = await client.updateDownloadClientConfig(updated)

		if (flags.json) {
			this.log(JSON.stringify(result, null, 2))
		} else {
			this.log("✓ Completed download handling settings updated")
		}
	}
}
