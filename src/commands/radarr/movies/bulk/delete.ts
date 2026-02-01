import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrMoviesBulkDelete extends Command {
	static description = "Bulk delete multiple movies"

	static examples = [
		"<%= config.bin %> radarr movies bulk delete --ids 1,2,3",
		"<%= config.bin %> radarr movies bulk delete --ids 1,2,3 --delete-files",
		"<%= config.bin %> radarr movies bulk delete --ids 1,2,3 --add-exclusion",
	]

	static flags = {
		ids: Flags.string({ description: "Comma-separated movie IDs", required: true }),
		"delete-files": Flags.boolean({ description: "Also delete movie files" }),
		"add-exclusion": Flags.boolean({ description: "Add movies to import exclusion list" }),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrMoviesBulkDelete)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const movieIds = flags.ids.split(",").map((id) => Number.parseInt(id.trim(), 10))

		await client.bulkDeleteMovies(
			movieIds,
			flags["delete-files"] ?? false,
			flags["add-exclusion"] ?? false,
		)

		if (flags.json) {
			this.log(JSON.stringify({ deleted: true, count: movieIds.length, ids: movieIds }, null, 2))
			return
		}

		this.log(`✓ Deleted ${movieIds.length} movie(s)`)
		if (flags["delete-files"]) this.log("  Files were also deleted")
		if (flags["add-exclusion"]) this.log("  Movies added to exclusion list")
	}
}
