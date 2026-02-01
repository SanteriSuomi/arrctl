import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrRemotepathsDelete extends Command {
	static description = "Delete a remote path mapping"

	static examples = ["<%= config.bin %> radarr remotepaths delete 1"]

	static args = {
		id: Args.integer({
			description: "Remote path mapping ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrRemotepathsDelete)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		await client.deleteRemotePathMapping(args.id)

		if (flags.json) {
			this.log(JSON.stringify({ deleted: true, id: args.id }, null, 2))
			return
		}

		this.log(`✓ Deleted remote path mapping ID: ${args.id}`)
	}
}
