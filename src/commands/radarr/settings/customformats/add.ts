import { readFile } from "node:fs/promises"

import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"
import type { CustomFormat } from "../../../../lib/radarr/types"

export default class RadarrCustomformatsAdd extends Command {
	static description = "Add a new custom format from JSON"

	static examples = [
		"<%= config.bin %> radarr settings customformats add --json-file format.json",
		"<%= config.bin %> radarr settings customformats show 1 --json > template.json",
	]

	static flags = {
		"json-file": Flags.string({
			description: "Path to JSON file containing custom format configuration",
			required: true,
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrCustomformatsAdd)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const content = await readFile(flags["json-file"], "utf-8")
		const input = JSON.parse(content) as CustomFormat

		const { id: _, ...formatData } = input

		const format = await client.addCustomFormat(formatData)

		if (flags.json) {
			this.log(JSON.stringify(format, null, 2))
			return
		}

		this.log(`Created custom format "${format.name}" (ID: ${format.id})`)
	}
}
