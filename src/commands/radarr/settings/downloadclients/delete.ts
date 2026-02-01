import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrDownloadclientsDelete extends Command {
	static description = "Delete a download client"

	static examples = ["<%= config.bin %> radarr downloadclients delete 1"]

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
		const { args, flags } = await this.parse(RadarrDownloadclientsDelete)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const clients = await client.getDownloadClients()
		const downloadClient = clients.find((c) => c.id === args.id)

		await client.deleteDownloadClient(args.id)

		if (flags.json) {
			this.log(JSON.stringify({ deleted: true, id: args.id }, null, 2))
			return
		}

		if (downloadClient) {
			this.log(`✓ Deleted download client "${downloadClient.name}" (ID: ${args.id})`)
		} else {
			this.log(`✓ Deleted download client ID: ${args.id}`)
		}
	}
}
