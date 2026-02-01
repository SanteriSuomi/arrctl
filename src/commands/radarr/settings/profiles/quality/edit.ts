import { readFile } from "node:fs/promises"

import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../../lib/config"
import { RadarrClient } from "../../../../../lib/radarr/client"
import type { QualityProfileFull } from "../../../../../lib/radarr/types"

export default class RadarrProfilesQualityEdit extends Command {
	static description = "Edit a quality profile"

	static examples = [
		"<%= config.bin %> radarr settings profiles quality edit 1 --name 'New Name'",
		"<%= config.bin %> radarr settings profiles quality edit 1 --json-file profile.json",
	]

	static args = {
		id: Args.integer({
			description: "Quality profile ID",
			required: true,
		}),
	}

	static flags = {
		name: Flags.string({ description: "Profile name" }),
		"upgrade-allowed": Flags.boolean({ description: "Allow upgrades", allowNo: true }),
		"json-file": Flags.string({
			description: "Path to JSON file for full profile replacement",
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrProfilesQualityEdit)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		let profile: QualityProfileFull

		if (flags["json-file"]) {
			const content = await readFile(flags["json-file"], "utf-8")
			profile = JSON.parse(content) as QualityProfileFull
			profile.id = args.id
		} else {
			profile = await client.getQualityProfile(args.id)
			if (flags.name) profile.name = flags.name
			if (flags["upgrade-allowed"] !== undefined) profile.upgradeAllowed = flags["upgrade-allowed"]
		}

		const updated = await client.updateQualityProfile(profile)

		if (flags.json) {
			this.log(JSON.stringify(updated, null, 2))
			return
		}

		this.log(`✓ Updated quality profile "${updated.name}" (ID: ${updated.id})`)
	}
}
