import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { formatTable } from "../../../../lib/format"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrExclusionsList extends Command {
	static description = "List all import exclusions"

	static examples = [
		"<%= config.bin %> radarr exclusions list",
		"<%= config.bin %> radarr exclusions list --json",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrExclusionsList)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const exclusions = await client.getExclusions()

		if (flags.json) {
			this.log(JSON.stringify(exclusions, null, 2))
			return
		}

		if (exclusions.length === 0) {
			this.log("No import exclusions")
			return
		}

		const table = formatTable(exclusions, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "TMDB", get: (row) => String(row.tmdbId) },
			{ header: "Title", get: (row) => row.movieTitle },
			{ header: "Year", get: (row) => String(row.movieYear) },
		])
		this.log(table)
	}
}
