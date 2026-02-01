import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrIndexersTest extends Command {
	static description = "Test an indexer connection"

	static examples = ["<%= config.bin %> radarr indexers test 1"]

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
		const { args, flags } = await this.parse(RadarrIndexersTest)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const indexer = await client.getIndexer(args.id)

		try {
			await client.testIndexer(indexer)

			if (flags.json) {
				this.log(JSON.stringify({ success: true, id: args.id, name: indexer.name }, null, 2))
				return
			}

			this.log(`✓ Indexer "${indexer.name}" test passed`)
		} catch (error) {
			if (flags.json) {
				this.log(JSON.stringify({ success: false, id: args.id, error: String(error) }, null, 2))
				return
			}

			this.error(`Indexer "${indexer.name}" test failed: ${error}`)
		}
	}
}
