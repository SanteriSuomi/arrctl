import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../lib/config"
import { formatTable } from "../../../lib/format"
import { RadarrClient } from "../../../lib/radarr/client"
import type { HistoryRecord } from "../../../lib/radarr/types"

export default class RadarrActivityHistory extends Command {
	static description = "Show download/import history"

	static examples = [
		"<%= config.bin %> radarr activity history",
		"<%= config.bin %> radarr activity history --filter failed",
		"<%= config.bin %> radarr activity history --page 2 --page-size 100",
	]

	static flags = {
		filter: Flags.string({
			description: "Filter by event type",
			options: ["grabbed", "failed", "imported", "deleted"],
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
		page: Flags.integer({ default: 1, description: "Page number" }),
		"page-size": Flags.integer({ default: 20, description: "Results per page" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrActivityHistory)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const response = await client.getHistory(flags.page, flags["page-size"])

		let records = response.records
		if (flags.filter) {
			const filterMap: Record<string, HistoryRecord["eventType"][]> = {
				grabbed: ["grabbed"],
				failed: ["downloadFailed"],
				imported: ["downloadFolderImported"],
				deleted: ["movieFileDeleted"],
			}
			const types = filterMap[flags.filter]
			records = records.filter((r) => types.includes(r.eventType))
		}

		if (flags.json) {
			this.log(JSON.stringify({ ...response, records }, null, 2))
			return
		}

		if (records.length === 0) {
			this.log("No history records found")
			return
		}

		const table = formatTable(records, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Title", get: (row) => row.sourceTitle },
			{ header: "Event", get: (row) => this.formatEventType(row.eventType) },
			{ header: "Quality", get: (row) => row.quality.quality.name },
			{ header: "Date", get: (row) => new Date(row.date).toLocaleString() },
		])
		this.log(table)

		this.log(
			`\nPage ${response.page} of ${Math.ceil(response.totalRecords / response.pageSize)} (${response.totalRecords} total)`,
		)
	}

	private formatEventType(type: HistoryRecord["eventType"]): string {
		const map: Record<HistoryRecord["eventType"], string> = {
			grabbed: "Grabbed",
			downloadFolderImported: "Imported",
			downloadFailed: "Failed",
			movieFileDeleted: "Deleted",
			movieFileRenamed: "Renamed",
		}
		return map[type] ?? type
	}
}
