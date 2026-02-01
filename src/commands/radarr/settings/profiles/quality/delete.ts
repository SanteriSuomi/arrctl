import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../../lib/config"
import { RadarrClient } from "../../../../../lib/radarr/client"

export default class RadarrProfilesQualityDelete extends Command {
	static description = "Delete a quality profile"

	static examples = ["<%= config.bin %> radarr profiles quality delete 1"]

	static args = {
		id: Args.integer({
			description: "Quality profile ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrProfilesQualityDelete)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const profiles = await client.getQualityProfilesFull()
		const profile = profiles.find((p) => p.id === args.id)

		await client.deleteQualityProfile(args.id)

		if (flags.json) {
			this.log(JSON.stringify({ deleted: true, id: args.id }, null, 2))
			return
		}

		if (profile) {
			this.log(`✓ Deleted quality profile "${profile.name}" (ID: ${args.id})`)
		} else {
			this.log(`✓ Deleted quality profile ID: ${args.id}`)
		}
	}
}
