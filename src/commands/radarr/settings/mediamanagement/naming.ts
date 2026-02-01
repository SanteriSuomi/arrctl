import { Flags } from "@oclif/core"
import { BaseSettingsCommand } from "../../../../lib/base-command.js"
import { requireConfig } from "../../../../lib/config.js"
import { RadarrClient } from "../../../../lib/radarr/client.js"

export default class SettingsMediaManagementNaming extends BaseSettingsCommand {
	static description = "Movie naming settings"

	static examples = [
		"<%= config.bin %> radarr settings mediamanagement naming --rename-movies",
		"<%= config.bin %> radarr settings mediamanagement naming --colon-replacement smart",
		"<%= config.bin %> radarr settings mediamanagement naming --standard-movie-format '{Movie Title} ({Release Year})'",
	]

	static flags = {
		"colon-replacement": Flags.string({
			description: "Colon replacement format",
			options: ["delete", "dash", "spaceDash", "spaceDashSpace", "smart"],
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
		"movie-folder-format": Flags.string({ description: "Movie folder format" }),
		"rename-movies": Flags.boolean({ description: "Rename movie files", allowNo: true }),
		"replace-illegal-characters": Flags.boolean({
			description: "Replace illegal characters",
			allowNo: true,
		}),
		"standard-movie-format": Flags.string({ description: "Standard movie format" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsMediaManagementNaming)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getNamingConfig()

		const hasChanges =
			flags["rename-movies"] !== undefined ||
			flags["replace-illegal-characters"] !== undefined ||
			flags["colon-replacement"] !== undefined ||
			flags["standard-movie-format"] !== undefined ||
			flags["movie-folder-format"] !== undefined

		if (!hasChanges) {
			this.outputNoChanges(current, flags.json)
			return
		}

		const updated = { ...current }

		if (flags["rename-movies"] !== undefined) {
			updated.renameMovies = flags["rename-movies"]
		}
		if (flags["replace-illegal-characters"] !== undefined) {
			updated.replaceIllegalCharacters = flags["replace-illegal-characters"]
		}
		if (flags["colon-replacement"] !== undefined) {
			updated.colonReplacementFormat = flags[
				"colon-replacement"
			] as typeof current.colonReplacementFormat
		}
		if (flags["standard-movie-format"] !== undefined) {
			updated.standardMovieFormat = flags["standard-movie-format"]
		}
		if (flags["movie-folder-format"] !== undefined) {
			updated.movieFolderFormat = flags["movie-folder-format"]
		}

		const result = await client.updateNamingConfig(updated)

		this.outputResult(result, "✓ Naming settings updated", flags.json)
	}
}
