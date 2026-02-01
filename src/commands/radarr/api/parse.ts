import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../lib/config"
import { RadarrClient } from "../../../lib/radarr/client"

export default class RadarrParse extends Command {
	static description = "Parse a release name to see what Radarr extracts"

	static examples = [
		'<%= config.bin %> radarr parse "Movie.Name.2024.1080p.BluRay.x264-GROUP"',
		'<%= config.bin %> radarr parse "The.Movie.Title.2023.2160p.UHD.Blu-ray.Remux.HEVC.DTS-HD.MA.7.1-GROUP"',
	]

	static args = {
		title: Args.string({
			description: "Release name to parse",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrParse)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const result = await client.parseRelease(args.title)

		if (flags.json) {
			this.log(JSON.stringify(result, null, 2))
			return
		}

		this.log("Parse Result:")
		this.log("─".repeat(40))
		this.log(`Input: ${result.title}`)

		if (result.parsedMovieInfo) {
			const info = result.parsedMovieInfo
			this.log(`\nParsed Information:`)
			this.log(`  Title(s):  ${info.movieTitles.join(", ")}`)
			this.log(`  Year:      ${info.year}`)
			this.log(`  Quality:   ${info.quality.quality.name}`)
			this.log(`  Languages: ${info.languages.map((l) => l.name).join(", ")}`)
			if (info.releaseGroup) this.log(`  Group:     ${info.releaseGroup}`)
			if (info.edition) this.log(`  Edition:   ${info.edition}`)
		} else {
			this.log("\n⚠ Could not parse release name")
		}

		if (result.movie) {
			this.log(`\nMatched Movie:`)
			this.log(`  ${result.movie.title} (${result.movie.year})`)
			this.log(`  TMDB: ${result.movie.tmdbId}`)
		}
	}
}
