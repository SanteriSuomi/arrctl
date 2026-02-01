import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { formatTable } from "../../../../lib/format"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrCustomformatsList extends Command {
	static description = "List all custom formats"

	static examples = [
		"<%= config.bin %> radarr customformats list",
		"<%= config.bin %> radarr customformats list --json",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrCustomformatsList)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const formats = await client.getCustomFormats()

		if (flags.json) {
			this.log(JSON.stringify(formats, null, 2))
			return
		}

		if (formats.length === 0) {
			this.log("No custom formats found")
			return
		}

		const table = formatTable(formats, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Name", get: (row) => row.name },
			{ header: "In Rename", get: (row) => (row.includeCustomFormatWhenRenaming ? "✓" : "✗") },
			{ header: "Specs", get: (row) => String(row.specifications.length) },
		])
		this.log(table)
	}
}
