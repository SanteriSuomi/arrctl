import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../../lib/config"
import { formatTable } from "../../../../../lib/format"
import { RadarrClient } from "../../../../../lib/radarr/client"

export default class RadarrProfilesDelayList extends Command {
	static description = "List all delay profiles"

	static examples = [
		"<%= config.bin %> radarr profiles delay list",
		"<%= config.bin %> radarr profiles delay list --json",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrProfilesDelayList)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const profiles = await client.getDelayProfiles()

		if (flags.json) {
			this.log(JSON.stringify(profiles, null, 2))
			return
		}

		if (profiles.length === 0) {
			this.log("No delay profiles found")
			return
		}

		const table = formatTable(profiles, [
			{ header: "ID", get: (row) => String(row.id) },
			{ header: "Protocol", get: (row) => row.preferredProtocol },
			{ header: "Usenet", get: (row) => (row.enableUsenet ? `${row.usenetDelay}m` : "off") },
			{ header: "Torrent", get: (row) => (row.enableTorrent ? `${row.torrentDelay}m` : "off") },
			{ header: "Bypass HQ", get: (row) => (row.bypassIfHighestQuality ? "✓" : "✗") },
			{ header: "Order", get: (row) => String(row.order) },
			{ header: "Tags", get: (row) => (row.tags.length > 0 ? row.tags.join(", ") : "all") },
		])
		this.log(table)
	}
}
