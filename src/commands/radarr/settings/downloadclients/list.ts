import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { formatTable } from "../../../../lib/format"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrDownloadclientsList extends Command {
	static description = "List all download clients"

	static examples = [
		"<%= config.bin %> radarr downloadclients list",
		"<%= config.bin %> radarr downloadclients list --json",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrDownloadclientsList)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const clients = await client.getDownloadClients()

		if (flags.json) {
			this.log(JSON.stringify(clients, null, 2))
			return
		}

		if (clients.length === 0) {
			this.log("No download clients configured")
			return
		}

		const table = formatTable(clients, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Name", get: (row) => row.name },
			{ header: "Type", get: (row) => row.implementationName },
			{ header: "Protocol", get: (row) => row.protocol },
			{ header: "Enabled", get: (row) => (row.enable ? "✓" : "✗") },
			{ header: "Priority", get: (row) => String(row.priority) },
		])
		this.log(table)
	}
}
