import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrIndexersDelete extends Command {
	static description = "Delete an indexer"

	static examples = ["<%= config.bin %> radarr indexers delete 1"]

	static args = {
		id: Args.integer({
			description: "Indexer ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrIndexersDelete)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const indexers = await client.getIndexers()
		const indexer = indexers.find((i) => i.id === args.id)

		await client.deleteIndexer(args.id)

		if (flags.json) {
			this.log(JSON.stringify({ deleted: true, id: args.id }, null, 2))
			return
		}

		if (indexer) {
			this.log(`✓ Deleted indexer "${indexer.name}" (ID: ${args.id})`)
		} else {
			this.log(`✓ Deleted indexer ID: ${args.id}`)
		}
	}
}
