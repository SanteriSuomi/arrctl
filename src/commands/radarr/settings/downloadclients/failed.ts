import { Flags } from "@oclif/core"
import { BaseSettingsCommand } from "../../../../lib/base-command"
import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class SettingsDownloadClientsFailed extends BaseSettingsCommand {
	static description = "Failed download handling settings"

	static examples = [
		"<%= config.bin %> radarr settings downloadclients failed --redownload",
		"<%= config.bin %> radarr settings downloadclients failed --no-redownload-interactive",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
		redownload: Flags.boolean({
			description: "Automatically search and download different release on failure",
			allowNo: true,
		}),
		"redownload-interactive": Flags.boolean({
			description: "Redownload failed releases from interactive search",
			allowNo: true,
		}),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsDownloadClientsFailed)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getDownloadClientConfig()

		const hasChanges =
			flags.redownload !== undefined || flags["redownload-interactive"] !== undefined

		if (!hasChanges) {
			this.outputNoChanges(current, flags.json)
			return
		}

		const updated = { ...current }

		if (flags.redownload !== undefined) {
			updated.autoRedownloadFailed = flags.redownload
		}
		if (flags["redownload-interactive"] !== undefined) {
			updated.autoRedownloadFailedFromInteractiveSearch = flags["redownload-interactive"]
		}

		const result = await client.updateDownloadClientConfig(updated)

		this.outputResult(result, "✓ Failed download handling settings updated", flags.json)
	}
}
