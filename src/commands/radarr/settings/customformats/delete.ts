import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrCustomformatsDelete extends Command {
	static description = "Delete a custom format"

	static examples = ["<%= config.bin %> radarr customformats delete 1"]

	static args = {
		id: Args.integer({
			description: "Custom format ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrCustomformatsDelete)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const formats = await client.getCustomFormats()
		const format = formats.find((f) => f.id === args.id)

		await client.deleteCustomFormat(args.id)

		if (flags.json) {
			this.log(JSON.stringify({ deleted: true, id: args.id }, null, 2))
			return
		}

		if (format) {
			this.log(`✓ Deleted custom format "${format.name}" (ID: ${args.id})`)
		} else {
			this.log(`✓ Deleted custom format ID: ${args.id}`)
		}
	}
}
