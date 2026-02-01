import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../../lib/config"
import { formatTable } from "../../../../../lib/format"
import { RadarrClient } from "../../../../../lib/radarr/client"

export default class RadarrProfilesQualityList extends Command {
	static description = "List all quality profiles"

	static examples = [
		"<%= config.bin %> radarr profiles quality list",
		"<%= config.bin %> radarr profiles quality list --json",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrProfilesQualityList)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const profiles = await client.getQualityProfilesFull()

		if (flags.json) {
			this.log(JSON.stringify(profiles, null, 2))
			return
		}

		if (profiles.length === 0) {
			this.log("No quality profiles found")
			return
		}

		const table = formatTable(profiles, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Name", get: (row) => row.name },
			{ header: "Cutoff", get: (row) => getCutoffName(row) },
			{ header: "Upgrade", get: (row) => (row.upgradeAllowed ? "✓" : "✗") },
			{ header: "Language", get: (row) => row.language?.name ?? "-" },
			{ header: "Min Score", get: (row) => String(row.minFormatScore) },
		])
		this.log(table)
	}
}

function getCutoffName(profile: {
	cutoff: number
	items: Array<{ id?: number; name?: string; quality?: { id: number; name: string } }>
}): string {
	for (const item of profile.items) {
		if (item.quality?.id === profile.cutoff) return item.quality.name
		if (item.id === profile.cutoff && item.name) return item.name
	}
	return String(profile.cutoff)
}
