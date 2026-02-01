import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { formatTable } from "../../../../lib/format"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrIndexersList extends Command {
	static description = "List all indexers"

	static examples = [
		"<%= config.bin %> radarr indexers list",
		"<%= config.bin %> radarr indexers list --json",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrIndexersList)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const indexers = await client.getIndexers()

		if (flags.json) {
			this.log(JSON.stringify(indexers, null, 2))
			return
		}

		if (indexers.length === 0) {
			this.log("No indexers configured")
			return
		}

		const table = formatTable(indexers, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Name", get: (row) => row.name },
			{ header: "Type", get: (row) => row.implementationName },
			{ header: "Protocol", get: (row) => row.protocol },
			{ header: "RSS", get: (row) => (row.enableRss ? "✓" : "✗") },
			{ header: "Auto", get: (row) => (row.enableAutomaticSearch ? "✓" : "✗") },
			{ header: "Priority", get: (row) => String(row.priority) },
		])
		this.log(table)
	}
}
