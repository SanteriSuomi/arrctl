import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrMetadataDelete extends Command {
	static description = "Delete a metadata provider"

	static examples = ["<%= config.bin %> radarr metadata delete 1"]

	static args = {
		id: Args.integer({
			description: "Metadata provider ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrMetadataDelete)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const providers = await client.getMetadataProviders()
		const provider = providers.find((p) => p.id === args.id)

		await client.deleteMetadataProvider(args.id)

		if (flags.json) {
			this.log(JSON.stringify({ deleted: true, id: args.id }, null, 2))
			return
		}

		if (provider) {
			this.log(`✓ Deleted metadata provider "${provider.name}" (ID: ${args.id})`)
		} else {
			this.log(`✓ Deleted metadata provider ID: ${args.id}`)
		}
	}
}
