import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrImportlistsTest extends Command {
	static description = "Test an import list connection"

	static examples = ["<%= config.bin %> radarr importlists test 1"]

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
		const { args, flags } = await this.parse(RadarrImportlistsTest)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const list = await client.getImportList(args.id)

		try {
			await client.testImportList(list)

			if (flags.json) {
				this.log(JSON.stringify({ success: true, id: args.id, name: list.name }, null, 2))
				return
			}

			this.log(`✓ Import list "${list.name}" test passed`)
		} catch (error) {
			if (flags.json) {
				this.log(JSON.stringify({ success: false, id: args.id, error: String(error) }, null, 2))
				return
			}

			this.error(`Import list "${list.name}" test failed: ${error}`)
		}
	}
}
