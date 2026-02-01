import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrImportlistsDelete extends Command {
	static description = "Delete an import list"

	static examples = ["<%= config.bin %> radarr importlists delete 1"]

	static args = {
		id: Args.integer({
			description: "Import list ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrImportlistsDelete)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const lists = await client.getImportLists()
		const list = lists.find((l) => l.id === args.id)

		await client.deleteImportList(args.id)

		if (flags.json) {
			this.log(JSON.stringify({ deleted: true, id: args.id }, null, 2))
			return
		}

		if (list) {
			this.log(`✓ Deleted import list "${list.name}" (ID: ${args.id})`)
		} else {
			this.log(`✓ Deleted import list ID: ${args.id}`)
		}
	}
}
