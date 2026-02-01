import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config.js"
import { RadarrClient } from "../../../../lib/radarr/client.js"

export default class SettingsUiMovies extends Command {
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
			if (flags.json) {
				this.log(JSON.stringify(current, null, 2))
			} else {
				this.log("Use --help for usage information")
			}
			return
		}

		const updated = { ...current }

		if (flags["runtime-format"] !== undefined) {
			updated.movieRuntimeFormat = flags["runtime-format"] as typeof current.movieRuntimeFormat
		}

		const result = await client.updateUiConfig(updated)

		if (flags.json) {
			this.log(JSON.stringify(result, null, 2))
		} else {
			this.log("✓ Movies UI settings updated")
		}
	}
}
