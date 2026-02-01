import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { formatTable } from "../../../../lib/format"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrImportlistsList extends Command {
	static description = "List all import lists"

	static examples = [
		"<%= config.bin %> radarr importlists list",
		"<%= config.bin %> radarr importlists list --json",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrImportlistsList)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const lists = await client.getImportLists()

		if (flags.json) {
			this.log(JSON.stringify(lists, null, 2))
			return
		}

		if (lists.length === 0) {
			this.log("No import lists configured")
			return
		}

		const table = formatTable(lists, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Name", get: (row) => row.name },
			{ header: "Type", get: (row) => row.implementationName },
			{ header: "Enabled", get: (row) => (row.enabled ? "✓" : "✗") },
			{ header: "Auto", get: (row) => (row.enableAuto ? "✓" : "✗") },
			{ header: "Monitor", get: (row) => row.monitor },
		])
		this.log(table)
	}
}
