import { readFile } from "node:fs/promises"

import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"
import type { MetadataResource } from "../../../../lib/radarr/types"

export default class RadarrMetadataAdd extends Command {
	static description = "Add a new metadata provider from JSON"

	static examples = [
		"<%= config.bin %> radarr settings metadata add --json-file provider.json",
		"<%= config.bin %> radarr settings metadata show 1 --json > template.json",
	]

	static flags = {
		"json-file": Flags.string({
			description: "Path to JSON file containing metadata provider configuration",
			required: true,
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrMetadataAdd)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const content = await readFile(flags["json-file"], "utf-8")
		const input = JSON.parse(content) as MetadataResource

		const { id: _, ...providerData } = input

		const provider = await client.addMetadataProvider(providerData)

		if (flags.json) {
			this.log(JSON.stringify(provider, null, 2))
			return
		}

		this.log(`Created metadata provider "${provider.name}" (ID: ${provider.id})`)
	}
}
