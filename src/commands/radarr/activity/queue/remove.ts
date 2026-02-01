import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrActivityQueueRemove extends Command {
	static description = "Remove an item from the download queue"

	static examples = [
		"<%= config.bin %> radarr activity queue remove 123",
		"<%= config.bin %> radarr activity queue remove 123 --blocklist",
		"<%= config.bin %> radarr activity queue remove 123 --remove-from-client",
	]

	static args = {
		id: Args.integer({
			description: "Queue item ID",
			required: true,
		}),
	}

	static flags = {
		blocklist: Flags.boolean({
			description: "Add release to blocklist",
			default: false,
		}),
		"remove-from-client": Flags.boolean({
			description: "Remove from download client",
			default: false,
		}),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrActivityQueueRemove)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		await client.removeQueueItem(args.id, {
			blocklist: flags.blocklist,
			removeFromClient: flags["remove-from-client"],
		})

		let message = `Removed queue item ${args.id}`
		if (flags.blocklist) message += " (added to blocklist)"
		if (flags["remove-from-client"]) message += " (removed from download client)"
		this.log(message)
	}
}
