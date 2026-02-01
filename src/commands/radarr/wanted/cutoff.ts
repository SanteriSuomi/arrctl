import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../lib/config"
import { formatSize, formatTable } from "../../../lib/format"
import { RadarrClient } from "../../../lib/radarr/client"

export default class RadarrWantedCutoff extends Command {
	static description = "Show movies below quality cutoff"

	static examples = [
		"<%= config.bin %> radarr wanted cutoff",
		"<%= config.bin %> radarr wanted cutoff --page 2 --page-size 50",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
		page: Flags.integer({ default: 1, description: "Page number" }),
		"page-size": Flags.integer({ default: 20, description: "Results per page" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrWantedCutoff)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const response = await client.getCutoffUnmet(flags.page, flags["page-size"])

		if (flags.json) {
			this.log(JSON.stringify(response, null, 2))
			return
		}

		if (response.records.length === 0) {
			this.log("No movies below quality cutoff")
			return
		}

		const table = formatTable(response.records, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Title", get: (row) => row.title },
			{ header: "Year", get: (row) => String(row.year) },
			{ header: "Status", get: (row) => row.status },
			{ header: "Monitored", get: (row) => (row.monitored ? "Yes" : "No") },
			{ header: "Size", get: (row) => formatSize(row.sizeOnDisk) },
		])
		this.log(table)

		this.log(
			`\nPage ${response.page} of ${Math.ceil(response.totalRecords / response.pageSize)} (${response.totalRecords} total)`,
		)
	}
}
