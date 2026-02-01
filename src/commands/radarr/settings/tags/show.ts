import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrTagsShow extends Command {
	static description = "Show tag details"

	static examples = ["<%= config.bin %> radarr settings tags show 1"]

	static args = {
		id: Args.integer({
			description: "Tag ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrTagsShow)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const tags = await client.getTags()
		const tag = tags.find((t) => t.id === args.id)

		if (!tag) {
			this.error(`Tag ${args.id} not found`)
		}

		if (flags.json) {
			this.log(JSON.stringify(tag, null, 2))
			return
		}

		this.log(`Tag: ${tag.label}`)
		this.log("─".repeat(40))
		this.log(`ID:    ${tag.id}`)
		this.log(`Label: ${tag.label}`)
	}
}
