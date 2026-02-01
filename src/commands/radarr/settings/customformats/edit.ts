import { readFile } from "node:fs/promises"

import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"
import type { CustomFormat } from "../../../../lib/radarr/types"

export default class RadarrCustomformatsEdit extends Command {
	static description = "Edit a custom format"

	static examples = [
		"<%= config.bin %> radarr settings customformats edit 1 --name 'New Name'",
		"<%= config.bin %> radarr settings customformats edit 1 --json-file format.json",
	]

	static args = {
		id: Args.integer({
			description: "Custom format ID",
			required: true,
		}),
	}

	static flags = {
		name: Flags.string({ description: "Custom format name" }),
		"json-file": Flags.string({
			description: "Path to JSON file for full replacement",
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrCustomformatsEdit)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		let format: CustomFormat

		if (flags["json-file"]) {
			const content = await readFile(flags["json-file"], "utf-8")
			format = JSON.parse(content) as CustomFormat
			format.id = args.id
		} else {
			format = await client.getCustomFormat(args.id)
			if (flags.name) format.name = flags.name
		}

		const updated = await client.updateCustomFormat(format)

		if (flags.json) {
			this.log(JSON.stringify(updated, null, 2))
			return
		}

		this.log(`Updated custom format "${updated.name}" (ID: ${updated.id})`)
	}
}
