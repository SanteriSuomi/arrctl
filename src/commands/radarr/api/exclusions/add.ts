import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrExclusionsAdd extends Command {
	static description = "Add an import exclusion"

	static examples = [
		'<%= config.bin %> radarr exclusions add 12345 --title "Movie Name" --year 2024',
	]

	static args = {
		tmdbId: Args.integer({
			description: "TMDB ID of the movie to exclude",
			required: true,
		}),
	}

	static flags = {
		title: Flags.string({ description: "Movie title", required: true }),
		year: Flags.integer({ description: "Movie year", required: true }),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrExclusionsAdd)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const exclusion = await client.addExclusion({
			tmdbId: args.tmdbId,
			movieTitle: flags.title,
			movieYear: flags.year,
		})

		if (flags.json) {
			this.log(JSON.stringify(exclusion, null, 2))
			return
		}

		this.log(`✓ Added exclusion: ${exclusion.movieTitle} (${exclusion.movieYear})`)
		this.log(`  ID: ${exclusion.id}`)
		this.log(`  TMDB: ${exclusion.tmdbId}`)
	}
}
