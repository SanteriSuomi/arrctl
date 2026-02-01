import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../lib/config"
import { RadarrClient } from "../../../lib/radarr/client"

export default class RadarrMoviesRefresh extends Command {
	static description = "Refresh movie metadata"

	static examples = [
		"<%= config.bin %> radarr movies refresh 1",
		"<%= config.bin %> radarr movies refresh 1 --json",
	]

	static args = {
		id: Args.integer({
			description: "Movie ID to refresh",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrMoviesRefresh)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const movie = await client.getMovie(args.id)
		const command = await client.refreshMovie(args.id)

		if (flags.json) {
			this.log(JSON.stringify(command, null, 2))
			return
		}

		this.log(`✓ Triggered refresh for "${movie.title}" (Command ID: ${command.id})`)
	}
}
