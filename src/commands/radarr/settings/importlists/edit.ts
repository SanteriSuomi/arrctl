import { readFile } from "node:fs/promises"

import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"
import type { ImportListResource } from "../../../../lib/radarr/types"

export default class RadarrImportlistsEdit extends Command {
	static description = "Edit an import list"

	static examples = [
		"<%= config.bin %> radarr settings importlists edit 1 --name 'New Name'",
		"<%= config.bin %> radarr settings importlists edit 1 --json-file list.json",
	]

	static args = {
		id: Args.integer({
			description: "Import list ID",
			required: true,
		}),
	}

	static flags = {
		name: Flags.string({ description: "Import list name" }),
		"json-file": Flags.string({
			description: "Path to JSON file for full replacement",
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrImportlistsEdit)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		let list: ImportListResource

		if (flags["json-file"]) {
			const content = await readFile(flags["json-file"], "utf-8")
			list = JSON.parse(content) as ImportListResource
			list.id = args.id
		} else {
			list = await client.getImportList(args.id)
			if (flags.name) list.name = flags.name
		}

		const updated = await client.updateImportList(list)

		if (flags.json) {
			this.log(JSON.stringify(updated, null, 2))
			return
		}

		this.log(`Updated import list "${updated.name}" (ID: ${updated.id})`)
	}
}
