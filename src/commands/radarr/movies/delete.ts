import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../lib/config"
import { RadarrClient } from "../../../lib/radarr/client"

export default class RadarrMoviesDelete extends Command {
	static args = {
		id: Args.integer({
			description: "Movie ID",
			required: true,
		}),
	}

	static description = "Delete movie from library"

	static examples = [
		"<%= config.bin %> radarr movies delete 123",
		"<%= config.bin %> radarr movies delete 123 --delete-files",
		"<%= config.bin %> radarr movies delete 123 --add-exclusion",
	]

	static flags = {
		"add-exclusion": Flags.boolean({ description: "Add to exclusion list" }),
		"delete-files": Flags.boolean({ description: "Also delete downloaded files" }),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrMoviesDelete)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const movie = await client.getMovie(args.id)

		await client.deleteMovie(args.id, {
			deleteFiles: flags["delete-files"],
			addImportExclusion: flags["add-exclusion"],
		})

		if (flags.json) {
			this.log(JSON.stringify({ deleted: true, movie }, null, 2))
			return
		}

		this.log(`✓ Deleted "${movie.title}" (${movie.year})`)
		if (flags["delete-files"]) {
			this.log("  Files deleted")
		}
		if (flags["add-exclusion"]) {
			this.log("  Added to exclusion list")
		}
	}
}
