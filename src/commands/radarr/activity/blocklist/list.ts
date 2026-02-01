import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { formatTable } from "../../../../lib/format"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrActivityBlocklistList extends Command {
	static description = "Show blocked releases"

	static examples = [
		"<%= config.bin %> radarr activity blocklist list",
		"<%= config.bin %> radarr activity blocklist list --page 2 --page-size 50",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
		page: Flags.integer({ default: 1, description: "Page number" }),
		"page-size": Flags.integer({ default: 20, description: "Results per page" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrActivityBlocklistList)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const response = await client.getBlocklist(flags.page, flags["page-size"])

		if (flags.json) {
			this.log(JSON.stringify(response, null, 2))
			return
		}

		if (response.records.length === 0) {
			this.log("Blocklist is empty")
			return
		}

		const table = formatTable(response.records, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Title", get: (row) => row.sourceTitle },
			{ header: "Quality", get: (row) => row.quality.quality.name },
			{ header: "Protocol", get: (row) => row.protocol },
			{ header: "Indexer", get: (row) => row.indexer ?? "-" },
			{ header: "Date", get: (row) => new Date(row.date).toLocaleString() },
		])
		this.log(table)

		this.log(
			`\nPage ${response.page} of ${Math.ceil(response.totalRecords / response.pageSize)} (${response.totalRecords} total)`,
		)
	}
}
