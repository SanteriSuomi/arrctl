import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrDownloadclientsTest extends Command {
	static description = "Test a download client connection"

	static examples = ["<%= config.bin %> radarr downloadclients test 1"]

	static args = {
		id: Args.integer({
			description: "Download client ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrDownloadclientsTest)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const downloadClient = await client.getDownloadClient(args.id)

		try {
			await client.testDownloadClient(downloadClient)

			if (flags.json) {
				this.log(JSON.stringify({ success: true, id: args.id, name: downloadClient.name }, null, 2))
				return
			}

			this.log(`✓ Download client "${downloadClient.name}" test passed`)
		} catch (error) {
			if (flags.json) {
				this.log(JSON.stringify({ success: false, id: args.id, error: String(error) }, null, 2))
				return
			}

			this.error(`Download client "${downloadClient.name}" test failed: ${error}`)
		}
	}
}
