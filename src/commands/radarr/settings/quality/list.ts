import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { formatTable } from "../../../../lib/format"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrQualityDefinitionsList extends Command {
	static description = "List quality definitions with size limits"

	static examples = [
		"<%= config.bin %> radarr quality-definitions list",
		"<%= config.bin %> radarr quality-definitions list --json",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrQualityDefinitionsList)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const definitions = await client.getQualityDefinitions()

		if (flags.json) {
			this.log(JSON.stringify(definitions, null, 2))
			return
		}

		if (definitions.length === 0) {
			this.log("No quality definitions found")
			return
		}

		const table = formatTable(definitions, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Quality", get: (row) => row.quality.name },
			{ header: "Title", get: (row) => row.title },
			{ header: "Min (MB/min)", get: (row) => (row.minSize ?? 0).toFixed(1) },
			{
				header: "Max (MB/min)",
				get: (row) => (row.maxSize == null || row.maxSize === 0 ? "∞" : row.maxSize.toFixed(1)),
			},
			{ header: "Preferred", get: (row) => (row.preferredSize ?? 0).toFixed(1) },
		])
		this.log(table)
	}
}
