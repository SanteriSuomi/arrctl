import { Args, Command } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrActivityBlocklistRemove extends Command {
	static description = "Remove an item from the blocklist"

	static examples = ["<%= config.bin %> radarr activity blocklist remove 123"]

	static args = {
		id: Args.integer({
			description: "Blocklist item ID",
			required: true,
		}),
	}

	async run(): Promise<void> {
		const { args } = await this.parse(RadarrActivityBlocklistRemove)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		await client.removeBlocklistItem(args.id)
		this.log(`Removed blocklist item ${args.id}`)
	}
}
