import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../lib/config.js"
import { formatTable } from "../../lib/format.js"
import { RadarrClient } from "../../lib/radarr/client.js"

export default class RadarrCalendar extends Command {
	static description = "Show upcoming/recent releases"

	static examples = [
		"<%= config.bin %> radarr calendar",
		"<%= config.bin %> radarr calendar --days 14",
		"<%= config.bin %> radarr calendar --weeks 2",
		"<%= config.bin %> radarr calendar --past --days 30",
	]

	static flags = {
		days: Flags.integer({ description: "Days from now" }),
		hours: Flags.integer({ description: "Hours from now" }),
		json: Flags.boolean({ description: "Output as JSON" }),
		months: Flags.integer({ description: "Months from now" }),
		past: Flags.boolean({ description: "Look backwards instead of forwards" }),
		weeks: Flags.integer({ description: "Weeks from now" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrCalendar)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		let durationMs = 7 * 24 * 60 * 60 * 1000
		if (flags.hours) {
			durationMs = flags.hours * 60 * 60 * 1000
		} else if (flags.days) {
			durationMs = flags.days * 24 * 60 * 60 * 1000
		} else if (flags.weeks) {
			durationMs = flags.weeks * 7 * 24 * 60 * 60 * 1000
		} else if (flags.months) {
			durationMs = flags.months * 30 * 24 * 60 * 60 * 1000
		}

		const now = new Date()
		let start: Date
		let end: Date

		if (flags.past) {
			start = new Date(now.getTime() - durationMs)
			end = now
		} else {
			start = now
			end = new Date(now.getTime() + durationMs)
		}

		const movies = await client.getCalendar(start, end)

		if (flags.json) {
			this.log(JSON.stringify(movies, null, 2))
			return
		}

		if (movies.length === 0) {
			this.log("No releases found in the specified period")
			return
		}

		const table = formatTable(movies, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Title", get: (row) => row.title },
			{ header: "Year", get: (row) => String(row.year) },
			{ header: "Status", get: (row) => row.status },
			{
				header: "In Cinemas",
				get: (row) => (row.inCinemas ? new Date(row.inCinemas).toLocaleDateString() : "-"),
			},
			{
				header: "Physical",
				get: (row) =>
					row.physicalRelease ? new Date(row.physicalRelease).toLocaleDateString() : "-",
			},
			{
				header: "Digital",
				get: (row) =>
					row.digitalRelease ? new Date(row.digitalRelease).toLocaleDateString() : "-",
			},
		])
		this.log(table)
	}
}
