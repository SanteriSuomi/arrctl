import { readFile } from "node:fs/promises"

import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"
import type { MetadataResource } from "../../../../lib/radarr/types"

export default class RadarrMetadataEdit extends Command {
	static description = "Edit a metadata provider"

	static examples = [
		"<%= config.bin %> radarr settings metadata edit 1 --name 'New Name'",
		"<%= config.bin %> radarr settings metadata edit 1 --json-file provider.json",
	]

	static args = {
		id: Args.integer({
			description: "Metadata provider ID",
			required: true,
		}),
	}

	static flags = {
		name: Flags.string({ description: "Metadata provider name" }),
		"json-file": Flags.string({
			description: "Path to JSON file for full replacement",
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrMetadataEdit)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		let provider: MetadataResource

		if (flags["json-file"]) {
			const content = await readFile(flags["json-file"], "utf-8")
			provider = JSON.parse(content) as MetadataResource
			provider.id = args.id
		} else {
			provider = await client.getMetadataProvider(args.id)
			if (flags.name) provider.name = flags.name
		}

		const updated = await client.updateMetadataProvider(provider)

		if (flags.json) {
			this.log(JSON.stringify(updated, null, 2))
			return
		}

		this.log(`Updated metadata provider "${updated.name}" (ID: ${updated.id})`)
	}
}
