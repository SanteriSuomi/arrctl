import { Flags } from "@oclif/core"
import { BaseSettingsCommand } from "../../../../lib/base-command"
import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class SettingsMediaManagementPermissions extends BaseSettingsCommand {
	static description = "Linux permissions settings"

	static examples = [
		"<%= config.bin %> radarr settings mediamanagement permissions --set-permissions",
		"<%= config.bin %> radarr settings mediamanagement permissions --chmod-folder 755",
		"<%= config.bin %> radarr settings mediamanagement permissions --chown-group media",
	]

	static flags = {
		"chmod-folder": Flags.string({ description: "Folder chmod value (octal)" }),
		"chown-group": Flags.string({ description: "Group name or gid for chown" }),
		json: Flags.boolean({ description: "Output as JSON" }),
		"set-permissions": Flags.boolean({
			description: "Run chmod when files are imported/renamed",
			allowNo: true,
		}),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsMediaManagementPermissions)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getMediaManagementConfig()

		const hasChanges =
			flags["set-permissions"] !== undefined ||
			flags["chmod-folder"] !== undefined ||
			flags["chown-group"] !== undefined

		if (!hasChanges) {
			this.outputNoChanges(current, flags.json)
			return
		}

		const updated = { ...current }

		if (flags["set-permissions"] !== undefined) {
			updated.setPermissionsLinux = flags["set-permissions"]
		}
		if (flags["chmod-folder"] !== undefined) {
			updated.chmodFolder = flags["chmod-folder"]
		}
		if (flags["chown-group"] !== undefined) {
			updated.chownGroup = flags["chown-group"]
		}

		const result = await client.updateMediaManagementConfig(updated)

		this.outputResult(result, "✓ Permissions settings updated", flags.json)
	}
}
