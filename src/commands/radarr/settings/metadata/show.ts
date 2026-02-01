import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrMetadataShow extends Command {
	static description = "Show metadata provider details"

	static examples = ["<%= config.bin %> radarr settings metadata show 1"]

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
		const { args, flags } = await this.parse(RadarrMetadataShow)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const provider = await client.getMetadataProvider(args.id)

		if (flags.json) {
			this.log(JSON.stringify(provider, null, 2))
			return
		}

		this.log(`Metadata Provider: ${provider.name}`)
		this.log("─".repeat(40))
		this.log(`ID:      ${provider.id}`)
		this.log(`Type:    ${provider.implementationName}`)
		this.log(`Enabled: ${provider.enable ? "Yes" : "No"}`)

		if (provider.fields && provider.fields.length > 0) {
			this.log("\nConfiguration:")
			for (const field of provider.fields) {
				if (field.value !== undefined && field.value !== null && field.value !== "") {
					this.log(`  ${field.label}: ${field.value}`)
				}
			}
		}

		if (provider.tags && provider.tags.length > 0) {
			this.log(`\nTags: ${provider.tags.join(", ")}`)
		}
	}
}
