import { Flags } from "@oclif/core"
import { BaseSettingsCommand } from "../../../../lib/base-command.js"
import { requireConfig } from "../../../../lib/config.js"
import { RadarrClient } from "../../../../lib/radarr/client.js"

export default class SettingsUiStyle extends BaseSettingsCommand {
	static description = "Style settings (theme, color-impaired mode)"

	static examples = [
		"<%= config.bin %> radarr settings ui style --theme dark",
		"<%= config.bin %> radarr settings ui style --theme auto",
		"<%= config.bin %> radarr settings ui style --color-impaired-mode",
	]

	static flags = {
		"color-impaired-mode": Flags.boolean({
			description: "Enable color-impaired mode",
			allowNo: true,
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
		theme: Flags.string({
			description: "UI theme",
			options: ["auto", "dark", "light"],
		}),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsUiStyle)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getUiConfig()

		const hasChanges = flags.theme !== undefined || flags["color-impaired-mode"] !== undefined

		if (!hasChanges) {
			this.outputNoChanges(current, flags.json)
			return
		}

		const updated = { ...current }

		if (flags.theme !== undefined) {
			updated.theme = flags.theme as typeof current.theme
		}
		if (flags["color-impaired-mode"] !== undefined) {
			updated.enableColorImpairedMode = flags["color-impaired-mode"]
		}

		const result = await client.updateUiConfig(updated)

		this.outputResult(result, "✓ Style settings updated", flags.json)
	}
}
