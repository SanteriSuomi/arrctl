import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../../lib/config"
import { RadarrClient } from "../../../../../lib/radarr/client"

export default class RadarrProfilesDelayShow extends Command {
	static description = "Show delay profile details"

	static examples = ["<%= config.bin %> radarr settings profiles delay show 1"]

	static args = {
		id: Args.integer({
			description: "Delay profile ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrProfilesDelayShow)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const profile = await client.getDelayProfile(args.id)

		if (flags.json) {
			this.log(JSON.stringify(profile, null, 2))
			return
		}

		this.log(`Delay Profile: ${profile.id}`)
		this.log("─".repeat(40))
		this.log(`Preferred Protocol: ${profile.preferredProtocol}`)
		this.log(
			`Usenet:             ${profile.enableUsenet ? `${profile.usenetDelay}m delay` : "disabled"}`,
		)
		this.log(
			`Torrent:            ${profile.enableTorrent ? `${profile.torrentDelay}m delay` : "disabled"}`,
		)
		this.log(`Bypass if Highest:  ${profile.bypassIfHighestQuality ? "Yes" : "No"}`)
		this.log(
			`Bypass if Score >=: ${profile.bypassIfAboveCustomFormatScore ? profile.minimumCustomFormatScore : "No"}`,
		)
		this.log(`Order:              ${profile.order}`)
		this.log(
			`Tags:               ${profile.tags.length > 0 ? profile.tags.join(", ") : "all movies"}`,
		)
	}
}
