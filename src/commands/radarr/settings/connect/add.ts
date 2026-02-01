import { readFile } from "node:fs/promises"

import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"
import type { NotificationResource } from "../../../../lib/radarr/types"

export default class RadarrConnectAdd extends Command {
	static description = "Add a new notification connection from JSON"

	static examples = [
		"<%= config.bin %> radarr settings connect add --json-file notification.json",
		"<%= config.bin %> radarr settings connect show 1 --json > template.json",
	]

	static flags = {
		"json-file": Flags.string({
			description: "Path to JSON file containing notification configuration",
			required: true,
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrConnectAdd)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const content = await readFile(flags["json-file"], "utf-8")
		const input = JSON.parse(content) as NotificationResource

		const { id: _, ...notificationData } = input

		const notification = await client.addNotification(notificationData)

		if (flags.json) {
			this.log(JSON.stringify(notification, null, 2))
			return
		}

		this.log(`Created notification "${notification.name}" (ID: ${notification.id})`)
	}
}
