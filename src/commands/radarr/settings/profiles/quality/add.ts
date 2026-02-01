import { readFile } from "node:fs/promises"

import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../../lib/config"
import { RadarrClient } from "../../../../../lib/radarr/client"
import type { QualityProfileFull } from "../../../../../lib/radarr/types"

export default class RadarrProfilesQualityAdd extends Command {
	static description = "Add a new quality profile from JSON"

	static examples = [
		"<%= config.bin %> radarr settings profiles quality add --json-file profile.json",
		"<%= config.bin %> radarr settings profiles quality show 1 --json > template.json",
	]

	static flags = {
		"json-file": Flags.string({
			description: "Path to JSON file containing profile configuration",
			required: true,
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrProfilesQualityAdd)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const content = await readFile(flags["json-file"], "utf-8")
		const input = JSON.parse(content) as QualityProfileFull

		const { id: _, ...profileData } = input

		const profile = await client.addQualityProfile(profileData)

		if (flags.json) {
			this.log(JSON.stringify(profile, null, 2))
			return
		}

		this.log(`✓ Created quality profile "${profile.name}" (ID: ${profile.id})`)
	}
}
