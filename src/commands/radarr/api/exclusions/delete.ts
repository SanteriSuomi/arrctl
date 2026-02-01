import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrExclusionsDelete extends Command {
	static description = "Delete an import exclusion"

	static examples = ["<%= config.bin %> radarr exclusions delete 1"]

	static args = {
		id: Args.integer({
			description: "Exclusion ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrExclusionsDelete)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const exclusions = await client.getExclusions()
		const exclusion = exclusions.find((e) => e.id === args.id)

		await client.deleteExclusion(args.id)

		if (flags.json) {
			this.log(JSON.stringify({ deleted: true, id: args.id }, null, 2))
			return
		}

		if (exclusion) {
			this.log(`✓ Deleted exclusion: ${exclusion.movieTitle} (${exclusion.movieYear})`)
		} else {
			this.log(`✓ Deleted exclusion ID: ${args.id}`)
		}
	}
}
