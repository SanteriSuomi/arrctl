import { readFile } from "node:fs/promises"

import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"
import type { ImportListResource } from "../../../../lib/radarr/types"

export default class RadarrImportlistsAdd extends Command {
	static description = "Add a new import list from JSON"

	static examples = [
		"<%= config.bin %> radarr settings importlists add --json-file list.json",
		"<%= config.bin %> radarr settings importlists show 1 --json > template.json",
	]

	static flags = {
		"json-file": Flags.string({
			description: "Path to JSON file containing import list configuration",
			required: true,
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrImportlistsAdd)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const content = await readFile(flags["json-file"], "utf-8")
		const input = JSON.parse(content) as ImportListResource

		const { id: _, ...listData } = input

		const list = await client.addImportList(listData)

		if (flags.json) {
			this.log(JSON.stringify(list, null, 2))
			return
		}

		this.log(`Created import list "${list.name}" (ID: ${list.id})`)
	}
}
