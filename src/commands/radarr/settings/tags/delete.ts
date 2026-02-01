import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrTagsDelete extends Command {
	static description = "Delete a tag"

	static examples = ["<%= config.bin %> radarr tags delete 1"]

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
		const { args, flags } = await this.parse(RadarrTagsDelete)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const tags = await client.getTags()
		const tag = tags.find((t) => t.id === args.id)

		await client.deleteTag(args.id)

		if (flags.json) {
			this.log(JSON.stringify({ deleted: true, id: args.id }, null, 2))
			return
		}

		if (tag) {
			this.log(`✓ Deleted tag "${tag.label}" (ID: ${args.id})`)
		} else {
			this.log(`✓ Deleted tag ID: ${args.id}`)
		}
	}
}
