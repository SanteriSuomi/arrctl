import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../../lib/config"
import { RadarrClient } from "../../../../../lib/radarr/client"

export default class RadarrProfilesDelayAdd extends Command {
	static description = "Add a new delay profile"

	static examples = [
		"<%= config.bin %> radarr profiles delay add --usenet-delay 60 --torrent-delay 120",
		"<%= config.bin %> radarr profiles delay add --preferred-protocol torrent --torrent-delay 0",
	]

	static flags = {
		"preferred-protocol": Flags.string({
			description: "Preferred protocol",
			options: ["usenet", "torrent"],
			default: "usenet",
		}),
		"usenet-delay": Flags.integer({ description: "Usenet delay in minutes", default: 0 }),
		"torrent-delay": Flags.integer({ description: "Torrent delay in minutes", default: 0 }),
		"enable-usenet": Flags.boolean({ description: "Enable usenet", default: true, allowNo: true }),
		"enable-torrent": Flags.boolean({
			description: "Enable torrent",
			default: true,
			allowNo: true,
		}),
		"bypass-highest-quality": Flags.boolean({
			description: "Bypass if highest quality",
			default: true,
			allowNo: true,
		}),
		tags: Flags.string({ description: "Comma-separated tag IDs" }),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrProfilesDelayAdd)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const tagIds = flags.tags ? flags.tags.split(",").map((t) => Number.parseInt(t.trim(), 10)) : []

		const profile = await client.addDelayProfile({
			preferredProtocol: flags["preferred-protocol"] as "usenet" | "torrent",
			usenetDelay: flags["usenet-delay"],
			torrentDelay: flags["torrent-delay"],
			enableUsenet: flags["enable-usenet"],
			enableTorrent: flags["enable-torrent"],
			bypassIfHighestQuality: flags["bypass-highest-quality"],
			bypassIfAboveCustomFormatScore: false,
			minimumCustomFormatScore: 0,
			order: 0,
			tags: tagIds,
		})

		if (flags.json) {
			this.log(JSON.stringify(profile, null, 2))
			return
		}

		this.log(`✓ Created delay profile (ID: ${profile.id})`)
		this.log(`  Preferred: ${profile.preferredProtocol}`)
		this.log(`  Usenet: ${profile.enableUsenet ? `${profile.usenetDelay}m delay` : "disabled"}`)
		this.log(`  Torrent: ${profile.enableTorrent ? `${profile.torrentDelay}m delay` : "disabled"}`)
	}
}
