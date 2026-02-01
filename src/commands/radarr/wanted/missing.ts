import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../lib/config.js"
import { formatTable } from "../../../lib/format.js"
import { RadarrClient } from "../../../lib/radarr/client.js"

export default class RadarrWantedMissing extends Command {
	static description = "Show movies without files"

	static examples = [
		"<%= config.bin %> radarr wanted missing",
		"<%= config.bin %> radarr wanted missing --page 2 --page-size 50",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
		page: Flags.integer({ default: 1, description: "Page number" }),
		"page-size": Flags.integer({ default: 20, description: "Results per page" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrWantedMissing)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const response = await client.getMissing(flags.page, flags["page-size"])

		if (flags.json) {
			this.log(JSON.stringify(response, null, 2))
			return
		}

		if (response.records.length === 0) {
			this.log("No missing movies found")
			return
		}

		const table = formatTable(response.records, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Title", get: (row) => row.title },
			{ header: "Year", get: (row) => String(row.year) },
			{ header: "Status", get: (row) => row.status },
			{ header: "Monitored", get: (row) => (row.monitored ? "Yes" : "No") },
			{ header: "Added", get: (row) => new Date(row.added).toLocaleDateString() },
		])
		this.log(table)

		this.log(
			`\nPage ${response.page} of ${Math.ceil(response.totalRecords / response.pageSize)} (${response.totalRecords} total)`,
		)
	}
}
