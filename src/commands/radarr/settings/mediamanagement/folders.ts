import { Flags } from "@oclif/core"
import { BaseSettingsCommand } from "../../../../lib/base-command.js"
import { requireConfig } from "../../../../lib/config.js"
import { RadarrClient } from "../../../../lib/radarr/client.js"

export default class SettingsMediaManagementFolders extends BaseSettingsCommand {
	static description = "Folder creation/deletion settings"

	static examples = [
		"<%= config.bin %> radarr settings mediamanagement folders --delete-empty-folders",
		"<%= config.bin %> radarr settings mediamanagement folders --no-create-empty-folders",
	]

	static flags = {
		"create-empty-folders": Flags.boolean({
			description: "Create missing movie folders during disk scan",
			allowNo: true,
		}),
		"delete-empty-folders": Flags.boolean({
			description: "Delete empty movie folders during disk scan",
			allowNo: true,
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsMediaManagementFolders)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getMediaManagementConfig()

		const hasChanges =
			flags["create-empty-folders"] !== undefined || flags["delete-empty-folders"] !== undefined

		if (!hasChanges) {
			this.outputNoChanges(current, flags.json)
			return
		}

		const updated = { ...current }

		if (flags["create-empty-folders"] !== undefined) {
			updated.createEmptyMovieFolders = flags["create-empty-folders"]
		}
		if (flags["delete-empty-folders"] !== undefined) {
			updated.deleteEmptyFolders = flags["delete-empty-folders"]
		}

		const result = await client.updateMediaManagementConfig(updated)

		this.outputResult(result, "✓ Folder settings updated", flags.json)
	}
}
