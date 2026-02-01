import { Flags } from "@oclif/core"
import { BaseSettingsCommand } from "../../../../lib/base-command.js"
import { requireConfig } from "../../../../lib/config.js"
import { RadarrClient } from "../../../../lib/radarr/client.js"

export default class SettingsDownloadClientsCompleted extends BaseSettingsCommand {
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
			this.outputNoChanges(current, flags.json)
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

		this.outputResult(result, "✓ Completed download handling settings updated", flags.json)
	}
}
