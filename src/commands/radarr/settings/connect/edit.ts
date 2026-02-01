import { readFile } from "node:fs/promises"

import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"
import type { NotificationResource } from "../../../../lib/radarr/types"

export default class RadarrConnectEdit extends Command {
	static description = "Edit a notification connection"

	static examples = [
		"<%= config.bin %> radarr settings connect edit 1 --name 'New Name'",
		"<%= config.bin %> radarr settings connect edit 1 --json-file notification.json",
	]

	static args = {
		id: Args.integer({
			description: "Notification ID",
			required: true,
		}),
	}

	static flags = {
		name: Flags.string({ description: "Notification name" }),
		"json-file": Flags.string({
			description: "Path to JSON file for full replacement",
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrConnectEdit)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		let notification: NotificationResource

		if (flags["json-file"]) {
			const content = await readFile(flags["json-file"], "utf-8")
			notification = JSON.parse(content) as NotificationResource
			notification.id = args.id
		} else {
			notification = await client.getNotification(args.id)
			if (flags.name) notification.name = flags.name
		}

		const updated = await client.updateNotification(notification)

		if (flags.json) {
			this.log(JSON.stringify(updated, null, 2))
			return
		}

		this.log(`Updated notification "${updated.name}" (ID: ${updated.id})`)
	}
}
