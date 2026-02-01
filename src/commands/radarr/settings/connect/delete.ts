import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrConnectDelete extends Command {
	static description = "Delete a notification connection"

	static examples = ["<%= config.bin %> radarr connect delete 1"]

	static args = {
		id: Args.integer({
			description: "Notification ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrConnectDelete)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const notifications = await client.getNotifications()
		const notification = notifications.find((n) => n.id === args.id)

		await client.deleteNotification(args.id)

		if (flags.json) {
			this.log(JSON.stringify({ deleted: true, id: args.id }, null, 2))
			return
		}

		if (notification) {
			this.log(`✓ Deleted notification "${notification.name}" (ID: ${args.id})`)
		} else {
			this.log(`✓ Deleted notification ID: ${args.id}`)
		}
	}
}
