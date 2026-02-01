import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../../lib/config"
import { RadarrClient } from "../../../../../lib/radarr/client"

export default class RadarrProfilesQualityShow extends Command {
	static description = "Show quality profile details"

	static examples = ["<%= config.bin %> radarr profiles quality show 1"]

	static args = {
		id: Args.integer({
			description: "Quality profile ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrProfilesQualityShow)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const profile = await client.getQualityProfile(args.id)

		if (flags.json) {
			this.log(JSON.stringify(profile, null, 2))
			return
		}

		this.log(`Quality Profile: ${profile.name}`)
		this.log("─".repeat(40))
		this.log(`ID:              ${profile.id}`)
		this.log(`Upgrade Allowed: ${profile.upgradeAllowed ? "Yes" : "No"}`)
		this.log(`Language:        ${profile.language?.name ?? "-"}`)
		this.log(`Min Format Score: ${profile.minFormatScore}`)
		this.log(`Cutoff Score:    ${profile.cutoffFormatScore}`)

		this.log("\nQualities (allowed):")
		for (const item of profile.items) {
			if (item.allowed) {
				const name = item.quality?.name ?? item.name ?? "Group"
				const marker =
					item.quality?.id === profile.cutoff || item.id === profile.cutoff ? " (cutoff)" : ""
				this.log(`  ✓ ${name}${marker}`)
			}
		}

		if (profile.formatItems.length > 0) {
			this.log("\nCustom Format Scores:")
			for (const format of profile.formatItems) {
				if (format.score !== 0) {
					this.log(`  ${format.name}: ${format.score > 0 ? "+" : ""}${format.score}`)
				}
			}
		}
	}
}
