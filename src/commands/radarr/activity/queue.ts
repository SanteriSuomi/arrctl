import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../lib/config.js"
import { formatSize, formatTable } from "../../../lib/format.js"
import { RadarrClient } from "../../../lib/radarr/client.js"

export default class RadarrActivityQueue extends Command {
	static description = "Show download queue"

	static examples = [
		"<%= config.bin %> radarr activity queue",
		"<%= config.bin %> radarr activity queue --page 2 --page-size 50",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
		page: Flags.integer({ default: 1, description: "Page number" }),
		"page-size": Flags.integer({ default: 20, description: "Results per page" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrActivityQueue)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const response = await client.getQueue(flags.page, flags["page-size"])

		if (flags.json) {
			this.log(JSON.stringify(response, null, 2))
			return
		}

		if (response.records.length === 0) {
			this.log("Queue is empty")
			return
		}

		const table = formatTable(response.records, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Title", get: (row) => row.title },
			{ header: "Status", get: (row) => row.status },
			{ header: "Quality", get: (row) => row.quality.quality.name },
			{ header: "Protocol", get: (row) => row.protocol },
			{ header: "Size", get: (row) => formatSize(row.size) },
			{ header: "Remaining", get: (row) => formatSize(row.sizeleft) },
			{ header: "ETA", get: (row) => row.timeleft ?? "-" },
		])
		this.log(table)

		this.log(
			`\nPage ${response.page} of ${Math.ceil(response.totalRecords / response.pageSize)} (${response.totalRecords} total)`,
		)
	}
}
