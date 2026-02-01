import { Flags } from "@oclif/core"
import { BaseSettingsCommand } from "../../../../lib/base-command"
import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class SettingsUiMovies extends BaseSettingsCommand {
	static description = "Movies UI settings"

	static examples = [
		"<%= config.bin %> radarr settings ui movies --runtime-format hoursMinutes",
		"<%= config.bin %> radarr settings ui movies --runtime-format minutes",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
		"runtime-format": Flags.string({
			description: "Movie runtime display format",
			options: ["hoursMinutes", "minutes"],
		}),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsUiMovies)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getUiConfig()

		const hasChanges = flags["runtime-format"] !== undefined

		if (!hasChanges) {
			this.outputNoChanges(current, flags.json)
			return
		}

		const updated = { ...current }

		if (flags["runtime-format"] !== undefined) {
			updated.movieRuntimeFormat = flags["runtime-format"] as typeof current.movieRuntimeFormat
		}

		const result = await client.updateUiConfig(updated)

		this.outputResult(result, "✓ Movies UI settings updated", flags.json)
	}
}
