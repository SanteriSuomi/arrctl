import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../../lib/config"
import { RadarrClient } from "../../../../../lib/radarr/client"

export default class RadarrProfilesDelayEdit extends Command {
	static description = "Edit a delay profile"

	static examples = [
		"<%= config.bin %> radarr settings profiles delay edit 1 --usenet-delay 60",
		"<%= config.bin %> radarr settings profiles delay edit 1 --preferred-protocol torrent",
	]

	static args = {
		id: Args.integer({
			description: "Delay profile ID",
			required: true,
		}),
	}

	static flags = {
		"preferred-protocol": Flags.string({
			description: "Preferred protocol",
			options: ["usenet", "torrent"],
		}),
		"usenet-delay": Flags.integer({ description: "Usenet delay in minutes" }),
		"torrent-delay": Flags.integer({ description: "Torrent delay in minutes" }),
		"enable-usenet": Flags.boolean({ description: "Enable usenet", allowNo: true }),
		"enable-torrent": Flags.boolean({ description: "Enable torrent", allowNo: true }),
		"bypass-highest-quality": Flags.boolean({
			description: "Bypass if highest quality",
			allowNo: true,
		}),
		tags: Flags.string({ description: "Comma-separated tag IDs (replaces existing)" }),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrProfilesDelayEdit)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const profile = await client.getDelayProfile(args.id)

		if (flags["preferred-protocol"]) {
			profile.preferredProtocol = flags["preferred-protocol"] as "usenet" | "torrent"
		}
		if (flags["usenet-delay"] !== undefined) {
			profile.usenetDelay = flags["usenet-delay"]
		}
		if (flags["torrent-delay"] !== undefined) {
			profile.torrentDelay = flags["torrent-delay"]
		}
		if (flags["enable-usenet"] !== undefined) {
			profile.enableUsenet = flags["enable-usenet"]
		}
		if (flags["enable-torrent"] !== undefined) {
			profile.enableTorrent = flags["enable-torrent"]
		}
		if (flags["bypass-highest-quality"] !== undefined) {
			profile.bypassIfHighestQuality = flags["bypass-highest-quality"]
		}
		if (flags.tags !== undefined) {
			profile.tags = flags.tags.split(",").map((t) => Number.parseInt(t.trim(), 10))
		}

		const updated = await client.updateDelayProfile(profile)

		if (flags.json) {
			this.log(JSON.stringify(updated, null, 2))
			return
		}

		this.log(`✓ Updated delay profile (ID: ${updated.id})`)
		this.log(`  Preferred: ${updated.preferredProtocol}`)
		this.log(`  Usenet: ${updated.enableUsenet ? `${updated.usenetDelay}m delay` : "disabled"}`)
		this.log(`  Torrent: ${updated.enableTorrent ? `${updated.torrentDelay}m delay` : "disabled"}`)
	}
}
