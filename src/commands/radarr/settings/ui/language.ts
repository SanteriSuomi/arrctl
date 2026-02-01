import { Flags } from "@oclif/core"
import { BaseSettingsCommand } from "../../../../lib/base-command"
import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class SettingsUiLanguage extends BaseSettingsCommand {
	static description = "Language settings"

	static examples = [
		"<%= config.bin %> radarr settings ui language --movie-info-language 1",
		"<%= config.bin %> radarr settings ui language --ui-language 1",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
		"movie-info-language": Flags.integer({ description: "Movie info language ID" }),
		"ui-language": Flags.integer({ description: "UI language ID" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsUiLanguage)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getUiConfig()

		const hasChanges =
			flags["movie-info-language"] !== undefined || flags["ui-language"] !== undefined

		if (!hasChanges) {
			this.outputNoChanges(current, flags.json)
			return
		}

		const updated = { ...current }

		if (flags["movie-info-language"] !== undefined) {
			updated.movieInfoLanguage = flags["movie-info-language"]
		}
		if (flags["ui-language"] !== undefined) {
			updated.uiLanguage = flags["ui-language"]
		}

		const result = await client.updateUiConfig(updated)

		this.outputResult(result, "✓ Language settings updated (browser reload required)", flags.json)
	}
}
