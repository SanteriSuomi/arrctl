import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrIndexersShow extends Command {
	static description = "Show indexer details"

	static examples = ["<%= config.bin %> radarr indexers show 1"]

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
		const { args, flags } = await this.parse(RadarrIndexersShow)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const indexer = await client.getIndexer(args.id)

		if (flags.json) {
			this.log(JSON.stringify(indexer, null, 2))
			return
		}

		this.log(`Indexer: ${indexer.name}`)
		this.log("─".repeat(40))
		this.log(`ID:         ${indexer.id}`)
		this.log(`Type:       ${indexer.implementationName}`)
		this.log(`Protocol:   ${indexer.protocol}`)
		this.log(`Priority:   ${indexer.priority}`)
		this.log(`RSS:        ${indexer.enableRss ? "Enabled" : "Disabled"}`)
		this.log(`Auto Search: ${indexer.enableAutomaticSearch ? "Enabled" : "Disabled"}`)
		this.log(`Interactive: ${indexer.enableInteractiveSearch ? "Enabled" : "Disabled"}`)

		if (indexer.tags.length > 0) {
			this.log(`Tags:       ${indexer.tags.join(", ")}`)
		}

		const visibleFields = indexer.fields.filter((f) => f.hidden !== "hidden" && f.value !== null)
		if (visibleFields.length > 0) {
			this.log("\nConfiguration:")
			for (const field of visibleFields) {
				const value = field.privacy === "password" ? "********" : String(field.value ?? "")
				this.log(`  ${field.label}: ${value}`)
			}
		}
	}
}
