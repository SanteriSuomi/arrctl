import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../../lib/config"
import { RadarrClient } from "../../../../../lib/radarr/client"

export default class RadarrProfilesDelayDelete extends Command {
	static description = "Delete a delay profile"

	static examples = ["<%= config.bin %> radarr profiles delay delete 1"]

	static args = {
		id: Args.integer({
			description: "Delay profile ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrProfilesDelayDelete)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		await client.deleteDelayProfile(args.id)

		if (flags.json) {
			this.log(JSON.stringify({ deleted: true, id: args.id }, null, 2))
			return
		}

		this.log(`✓ Deleted delay profile ID: ${args.id}`)
	}
}
