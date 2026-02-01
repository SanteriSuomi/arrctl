import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../lib/config"
import { formatTable } from "../../../lib/format"
import { RadarrClient } from "../../../lib/radarr/client"

export default class RadarrSystemLogs extends Command {
	static description = "View system logs"

	static examples = [
		"<%= config.bin %> radarr system logs",
		"<%= config.bin %> radarr system logs --page 2",
		"<%= config.bin %> radarr system logs --json",
	]

	static flags = {
		page: Flags.integer({ default: 1, description: "Page number" }),
		"page-size": Flags.integer({ default: 50, description: "Results per page" }),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrSystemLogs)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const response = await client.getLogs(flags.page, flags["page-size"])

		if (flags.json) {
			this.log(JSON.stringify(response, null, 2))
			return
		}

		if (response.records.length === 0) {
			this.log("No log entries found")
			return
		}

		const table = formatTable(response.records, [
			{ header: "Time", get: (row) => formatTime(row.time) },
			{ header: "Level", get: (row) => row.level.toUpperCase() },
			{ header: "Logger", get: (row) => truncate(row.logger, 20) },
			{ header: "Message", get: (row) => truncate(row.message, 60) },
		])
		this.log(table)

		this.log(
			`\nPage ${response.page} of ${Math.ceil(response.totalRecords / response.pageSize)} (${response.totalRecords} total)`,
		)
	}
}

function formatTime(iso: string): string {
	const date = new Date(iso)
	return date.toLocaleTimeString()
}

function truncate(str: string, max: number): string {
	if (str.length <= max) return str
	return `${str.slice(0, max - 3)}...`
}
