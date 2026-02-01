import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { formatTable } from "../../../../lib/format"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrConnectList extends Command {
	static description = "List all notification connections"

	static examples = [
		"<%= config.bin %> radarr connect list",
		"<%= config.bin %> radarr connect list --json",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrConnectList)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const notifications = await client.getNotifications()

		if (flags.json) {
			this.log(JSON.stringify(notifications, null, 2))
			return
		}

		if (notifications.length === 0) {
			this.log("No notification connections configured")
			return
		}

		const table = formatTable(notifications, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Name", get: (row) => row.name },
			{ header: "Type", get: (row) => row.implementationName },
			{ header: "Grab", get: (row) => (row.onGrab ? "✓" : "✗") },
			{ header: "Download", get: (row) => (row.onDownload ? "✓" : "✗") },
			{ header: "Health", get: (row) => (row.onHealthIssue ? "✓" : "✗") },
		])
		this.log(table)
	}
}
