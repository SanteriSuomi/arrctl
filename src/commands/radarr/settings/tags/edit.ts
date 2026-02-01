import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrTagsEdit extends Command {
	static description = "Edit an existing tag"

	static examples = ['<%= config.bin %> radarr tags edit 1 --label "new name"']

	static args = {
		id: Args.integer({
			description: "Tag ID",
			required: true,
		}),
	}

	static flags = {
		label: Flags.string({ description: "New tag label", required: true }),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrTagsEdit)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const tag = await client.updateTag({ id: args.id, label: flags.label })

		if (flags.json) {
			this.log(JSON.stringify(tag, null, 2))
			return
		}

		this.log(`✓ Updated tag "${tag.label}" (ID: ${tag.id})`)
	}
}
