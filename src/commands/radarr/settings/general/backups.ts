import { Flags } from "@oclif/core"
import { BaseSettingsCommand } from "../../../../lib/base-command"
import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class SettingsGeneralBackups extends BaseSettingsCommand {
	static description = "Backup settings"

	static examples = [
		"<%= config.bin %> radarr settings general backups --folder Backups",
		"<%= config.bin %> radarr settings general backups --interval 7 --retention 28",
	]

	static flags = {
		folder: Flags.string({ description: "Backup folder (relative to AppData)" }),
		interval: Flags.integer({ description: "Backup interval in days (1-7)" }),
		json: Flags.boolean({ description: "Output as JSON" }),
		retention: Flags.integer({ description: "Backup retention in days (1-90)" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsGeneralBackups)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getHostConfig()

		const hasChanges =
			flags.folder !== undefined || flags.interval !== undefined || flags.retention !== undefined

		if (!hasChanges) {
			this.outputNoChanges(current, flags.json)
			return
		}

		const updated = { ...current }

		if (flags.folder !== undefined) updated.backupFolder = flags.folder
		if (flags.interval !== undefined) updated.backupInterval = flags.interval
		if (flags.retention !== undefined) updated.backupRetention = flags.retention

		const result = await client.updateHostConfig(updated)

		this.outputResult(result, "✓ Backup settings updated", flags.json)
	}
}
