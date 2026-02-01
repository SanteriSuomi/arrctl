import { Args, Command } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrActivityQueueGrab extends Command {
	static description = "Force grab a queued release"

	static examples = ["<%= config.bin %> radarr activity queue grab 123"]

	static args = {
		id: Args.integer({
			description: "Queue item ID",
			required: true,
		}),
	}

	async run(): Promise<void> {
		const { args } = await this.parse(RadarrActivityQueueGrab)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		await client.grabQueueItem(args.id)
		this.log(`Grabbed queue item ${args.id}`)
	}
}
