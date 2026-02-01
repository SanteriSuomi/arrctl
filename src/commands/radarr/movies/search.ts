import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../lib/config"
import { formatTable } from "../../../lib/format"
import { RadarrClient } from "../../../lib/radarr/client"
import type { MovieResource } from "../../../lib/radarr/types"

export default class RadarrMoviesSearch extends Command {
	static args = {
		query: Args.string({
			description: "Search term, tmdb:<id>, or imdb:<id>",
			required: true,
		}),
	}

	static description = "Search for movies to add (TMDB)"

	static examples = [
		'<%= config.bin %> radarr movies search "the dark knight"',
		"<%= config.bin %> radarr movies search tmdb:155",
		"<%= config.bin %> radarr movies search imdb:tt0468569",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
		page: Flags.integer({ default: 1, description: "Page number" }),
		"page-size": Flags.integer({ default: 10, description: "Results per page" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrMoviesSearch)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		let results: MovieResource[]
		let isDirectLookup = false

		if (args.query.startsWith("tmdb:")) {
			const tmdbId = Number.parseInt(args.query.slice(5), 10)
			const movie = await client.lookupByTmdb(tmdbId)
			results = [movie]
			isDirectLookup = true
		} else if (args.query.startsWith("imdb:")) {
			const movie = await client.lookupByImdb(args.query.slice(5))
			results = [movie]
			isDirectLookup = true
		} else {
			results = await client.searchMovies(args.query)
		}

		const start = isDirectLookup ? 0 : (flags.page - 1) * flags["page-size"]
		const end = isDirectLookup ? results.length : start + flags["page-size"]
		const paginated = results.slice(start, end)

		if (flags.json) {
			this.log(JSON.stringify(paginated, null, 2))
			return
		}

		if (paginated.length === 0) {
			this.log("No results found")
			return
		}

		const table = formatTable(paginated, [
			{ header: "TMDB", get: (row) => String(row.tmdbId) },
			{ header: "Title", get: (row) => row.title },
			{ header: "Year", get: (row) => String(row.year) },
			{ header: "Status", get: (row) => row.status },
			{
				header: "Overview",
				get: (row) => (row.overview ? `${row.overview.slice(0, 60)}...` : "-"),
			},
		])
		this.log(table)

		if (!isDirectLookup && results.length > flags["page-size"]) {
			this.log(
				`\nPage ${flags.page} of ${Math.ceil(results.length / flags["page-size"])} (${results.length} total)`,
			)
		}
	}
}
