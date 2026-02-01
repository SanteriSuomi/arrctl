import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../lib/config.js"
import { formatSize, formatTable } from "../../../lib/format.js"
import { RadarrClient } from "../../../lib/radarr/client.js"
import type { MovieResource } from "../../../lib/radarr/types.js"

export default class RadarrMoviesList extends Command {
	static description = "List movies in library"

	static examples = [
		"<%= config.bin %> radarr movies list",
		"<%= config.bin %> radarr movies list --search inception",
		"<%= config.bin %> radarr movies list --status released --monitored",
		"<%= config.bin %> radarr movies list --missing",
		"<%= config.bin %> radarr movies list --sort year --desc",
	]

	static flags = {
		desc: Flags.boolean({ description: "Sort descending" }),
		"has-file": Flags.boolean({
			description: "Only show movies with files",
			exclusive: ["missing"],
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
		missing: Flags.boolean({
			description: "Only show movies without files",
			exclusive: ["has-file"],
		}),
		monitored: Flags.boolean({
			description: "Only show monitored movies",
			exclusive: ["unmonitored"],
		}),
		page: Flags.integer({ default: 1, description: "Page number" }),
		"page-size": Flags.integer({ default: 50, description: "Results per page" }),
		"quality-profile": Flags.integer({ description: "Filter by quality profile ID" }),
		search: Flags.string({ description: "Filter by title" }),
		sort: Flags.string({
			default: "title",
			description: "Sort field",
			options: ["title", "year", "added", "size", "rating"],
		}),
		status: Flags.string({
			description: "Filter by status",
			options: ["announced", "inCinemas", "released", "deleted"],
		}),
		unmonitored: Flags.boolean({
			description: "Only show unmonitored movies",
			exclusive: ["monitored"],
		}),
		year: Flags.integer({ description: "Filter by release year" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrMoviesList)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		let movies = await client.getMovies()

		if (flags.search) {
			const term = flags.search.toLowerCase()
			movies = movies.filter((m) => m.title.toLowerCase().includes(term))
		}
		if (flags.status) {
			movies = movies.filter((m) => m.status === flags.status)
		}
		if (flags.monitored) {
			movies = movies.filter((m) => m.monitored)
		}
		if (flags.unmonitored) {
			movies = movies.filter((m) => !m.monitored)
		}
		if (flags["has-file"]) {
			movies = movies.filter((m) => m.hasFile)
		}
		if (flags.missing) {
			movies = movies.filter((m) => !m.hasFile)
		}
		if (flags.year) {
			movies = movies.filter((m) => m.year === flags.year)
		}
		if (flags["quality-profile"]) {
			movies = movies.filter((m) => m.qualityProfileId === flags["quality-profile"])
		}

		const sortFn = this.getSortFn(flags.sort)
		movies.sort(sortFn)
		if (flags.desc) {
			movies.reverse()
		}

		const start = (flags.page - 1) * flags["page-size"]
		const end = start + flags["page-size"]
		const paginated = movies.slice(start, end)

		if (flags.json) {
			this.log(JSON.stringify(paginated, null, 2))
			return
		}

		if (paginated.length === 0) {
			this.log("No movies found")
			return
		}

		const table = formatTable(paginated, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Title", get: (row) => row.title },
			{ header: "Year", get: (row) => String(row.year) },
			{ header: "Status", get: (row) => row.status },
			{ header: "Monitored", get: (row) => (row.monitored ? "Yes" : "No") },
			{ header: "Has File", get: (row) => (row.hasFile ? "Yes" : "No") },
			{ header: "Size", get: (row) => formatSize(row.sizeOnDisk) },
		])
		this.log(table)

		this.log(
			`\nPage ${flags.page} of ${Math.ceil(movies.length / flags["page-size"])} (${movies.length} total)`,
		)
	}

	private getSortFn(field: string): (a: MovieResource, b: MovieResource) => number {
		switch (field) {
			case "year":
				return (a, b) => a.year - b.year
			case "added":
				return (a, b) => new Date(a.added).getTime() - new Date(b.added).getTime()
			case "size":
				return (a, b) => a.sizeOnDisk - b.sizeOnDisk
			case "rating":
				return (a, b) => (a.ratings?.tmdb?.value ?? 0) - (b.ratings?.tmdb?.value ?? 0)
			default:
				return (a, b) => a.sortTitle.localeCompare(b.sortTitle)
		}
	}
}
