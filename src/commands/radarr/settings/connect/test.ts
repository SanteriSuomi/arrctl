import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrConnectTest extends Command {
	static description = "Test a notification connection"

	static examples = ["<%= config.bin %> radarr connect test 1"]

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
		const { args, flags } = await this.parse(RadarrConnectTest)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const notification = await client.getNotification(args.id)

		try {
			await client.testNotification(notification)

			if (flags.json) {
				this.log(JSON.stringify({ success: true, id: args.id, name: notification.name }, null, 2))
				return
			}

			this.log(`✓ Notification "${notification.name}" test passed`)
		} catch (error) {
			if (flags.json) {
				this.log(JSON.stringify({ success: false, id: args.id, error: String(error) }, null, 2))
				return
			}

			this.error(`Notification "${notification.name}" test failed: ${error}`)
		}
	}
}
