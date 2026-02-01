import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrTagsAdd extends Command {
	static description = "Add a new tag"

	static examples = [
		"<%= config.bin %> radarr tags add 4k",
		'<%= config.bin %> radarr tags add "kids movies"',
	]

	static args = {
		label: Args.string({
			description: "Tag label",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrTagsAdd)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const tag = await client.addTag(args.label)

		if (flags.json) {
			this.log(JSON.stringify(tag, null, 2))
			return
		}

		this.log(`✓ Created tag "${tag.label}" (ID: ${tag.id})`)
	}
}
