import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../lib/config"
import { RadarrClient } from "../../../lib/radarr/client"

export default class RadarrMoviesMovieSearch extends Command {
	static description = "Trigger a search for a movie"

	static examples = [
		"<%= config.bin %> radarr movies movie-search 1",
		"<%= config.bin %> radarr movies movie-search 1 --json",
	]

	static args = {
		id: Args.integer({
			description: "Movie ID to search for",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrMoviesMovieSearch)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const movie = await client.getMovie(args.id)
		const command = await client.searchMovie(args.id)

		if (flags.json) {
			this.log(JSON.stringify(command, null, 2))
			return
		}

		this.log(`✓ Triggered search for "${movie.title}" (Command ID: ${command.id})`)
	}
}
