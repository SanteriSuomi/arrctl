import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { formatTable } from "../../../../lib/format"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrTagsList extends Command {
	static description = "List all tags"

	static examples = [
		"<%= config.bin %> radarr tags list",
		"<%= config.bin %> radarr tags list --json",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrTagsList)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const tags = await client.getTags()

		if (flags.json) {
			this.log(JSON.stringify(tags, null, 2))
			return
		}

		if (tags.length === 0) {
			this.log("No tags found")
			return
		}

		const table = formatTable(tags, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Label", get: (row) => row.label },
		])
		this.log(table)
	}
}
