import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrMoviesBulkEdit extends Command {
	static description = "Bulk edit multiple movies"

	static examples = [
		"<%= config.bin %> radarr movies bulk edit --ids 1,2,3 --monitored",
		"<%= config.bin %> radarr movies bulk edit --ids 1,2,3 --quality-profile 4",
		"<%= config.bin %> radarr movies bulk edit --ids 1,2,3 --tags 1,2 --apply-tags add",
	]

	static flags = {
		ids: Flags.string({ description: "Comma-separated movie IDs", required: true }),
		monitored: Flags.boolean({ description: "Set monitored status", allowNo: true }),
		"quality-profile": Flags.integer({ description: "Quality profile ID" }),
		"minimum-availability": Flags.string({
			description: "Minimum availability",
			options: ["announced", "inCinemas", "released"],
		}),
		"root-folder": Flags.string({ description: "Root folder path" }),
		tags: Flags.string({ description: "Comma-separated tag IDs" }),
		"apply-tags": Flags.string({
			description: "How to apply tags",
			options: ["add", "remove", "replace"],
			default: "add",
		}),
		"move-files": Flags.boolean({ description: "Move files when changing root folder" }),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrMoviesBulkEdit)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const movieIds = flags.ids.split(",").map((id) => Number.parseInt(id.trim(), 10))
		const tagIds = flags.tags
			? flags.tags.split(",").map((t) => Number.parseInt(t.trim(), 10))
			: undefined

		const payload: Parameters<typeof client.bulkEditMovies>[0] = {
			movieIds,
		}

		if (flags.monitored !== undefined) payload.monitored = flags.monitored
		if (flags["quality-profile"]) payload.qualityProfileId = flags["quality-profile"]
		if (flags["minimum-availability"]) {
			payload.minimumAvailability = flags["minimum-availability"] as
				| "announced"
				| "inCinemas"
				| "released"
		}
		if (flags["root-folder"]) payload.rootFolderPath = flags["root-folder"]
		if (tagIds) {
			payload.tags = tagIds
			payload.applyTags = flags["apply-tags"] as "add" | "remove" | "replace"
		}
		if (flags["move-files"]) payload.moveFiles = true

		const updated = await client.bulkEditMovies(payload)

		if (flags.json) {
			this.log(JSON.stringify(updated, null, 2))
			return
		}

		this.log(`✓ Updated ${updated.length} movie(s)`)
	}
}
