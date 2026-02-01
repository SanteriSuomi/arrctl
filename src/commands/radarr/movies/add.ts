import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../lib/config"
import { RadarrClient } from "../../../lib/radarr/client"
import type { AddMoviePayload } from "../../../lib/radarr/types"

export default class RadarrMoviesAdd extends Command {
	static args = {
		tmdbId: Args.integer({
			description: "TMDB ID of movie to add",
			required: true,
		}),
	}

	static description = "Add movie to library"

	static examples = [
		"<%= config.bin %> radarr movies add 27205",
		"<%= config.bin %> radarr movies add 27205 --root-folder /movies",
		"<%= config.bin %> radarr movies add 27205 --monitor collection --quality-profile 7",
		"<%= config.bin %> radarr movies add 27205 --tags anime,4k --no-search",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
		"minimum-availability": Flags.string({
			default: "released",
			description: "Minimum availability",
			options: ["announced", "inCinemas", "released"],
		}),
		monitor: Flags.string({
			default: "movieOnly",
			description: "Monitor mode",
			options: ["movieOnly", "movieAndCollection", "none"],
		}),
		"no-search": Flags.boolean({ description: "Don't search for movie after adding" }),
		"quality-profile": Flags.integer({ description: "Quality profile ID" }),
		"root-folder": Flags.string({ description: "Root folder path" }),
		tags: Flags.string({ description: "Comma-separated tag names or IDs" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrMoviesAdd)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const movie = await client.lookupByTmdb(args.tmdbId)

		const rootFolders = await client.getRootFolders()
		const qualityProfiles = await client.getQualityProfiles()
		const allTags = await client.getTags()

		if (rootFolders.length === 0) {
			this.error("No root folders configured in Radarr")
		}
		if (qualityProfiles.length === 0) {
			this.error("No quality profiles configured in Radarr")
		}

		let rootFolderPath = flags["root-folder"]
		if (!rootFolderPath) {
			rootFolderPath = rootFolders[0].path
		} else {
			const found = rootFolders.find((rf) => rf.path === rootFolderPath)
			if (!found) {
				this.error(
					`Root folder "${rootFolderPath}" not found. Available: ${rootFolders.map((rf) => rf.path).join(", ")}`,
				)
			}
		}

		let qualityProfileId = flags["quality-profile"]
		if (!qualityProfileId) {
			qualityProfileId = qualityProfiles[0].id
		} else {
			const found = qualityProfiles.find((qp) => qp.id === qualityProfileId)
			if (!found) {
				this.error(
					`Quality profile ID ${qualityProfileId} not found. Available: ${qualityProfiles.map((qp) => `${qp.id} (${qp.name})`).join(", ")}`,
				)
			}
		}

		const tagIds: number[] = []
		if (flags.tags) {
			for (const tag of flags.tags.split(",")) {
				const trimmed = tag.trim()
				const asNumber = Number.parseInt(trimmed, 10)
				if (!Number.isNaN(asNumber)) {
					const found = allTags.find((t) => t.id === asNumber)
					if (!found) {
						this.error(`Tag ID ${asNumber} not found`)
					}
					tagIds.push(asNumber)
				} else {
					const found = allTags.find((t) => t.label.toLowerCase() === trimmed.toLowerCase())
					if (!found) {
						this.error(
							`Tag "${trimmed}" not found. Available: ${allTags.map((t) => t.label).join(", ")}`,
						)
					}
					tagIds.push(found.id)
				}
			}
		}

		const payload: AddMoviePayload = {
			title: movie.title,
			tmdbId: movie.tmdbId,
			year: movie.year,
			qualityProfileId,
			rootFolderPath,
			minimumAvailability: flags["minimum-availability"] as "announced" | "inCinemas" | "released",
			monitored: flags.monitor !== "none",
			tags: tagIds,
			addOptions: {
				monitor: flags.monitor as "movieOnly" | "movieAndCollection" | "none",
				searchForMovie: !flags["no-search"],
			},
		}

		const added = await client.addMovie(payload)

		if (flags.json) {
			this.log(JSON.stringify(added, null, 2))
			return
		}

		const qualityProfileName =
			qualityProfiles.find((qp) => qp.id === qualityProfileId)?.name ?? String(qualityProfileId)
		const tagNames = tagIds.map((id) => allTags.find((t) => t.id === id)?.label ?? String(id))

		this.log(`✓ Added "${added.title}" (${added.year})`)
		this.log(`  ID:           ${added.id}`)
		this.log(`  TMDB:         ${added.tmdbId}`)
		this.log(`  Root Folder:  ${rootFolderPath}`)
		this.log(`  Quality:      ${qualityProfileName}`)
		this.log(`  Monitor:      ${flags.monitor}`)
		this.log(`  Availability: ${flags["minimum-availability"]}`)
		this.log(`  Tags:         ${tagNames.length > 0 ? tagNames.join(", ") : "-"}`)
		this.log(`  Search:       ${flags["no-search"] ? "no" : "yes"}`)
	}
}
