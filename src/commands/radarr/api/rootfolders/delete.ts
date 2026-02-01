import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrRootfoldersDelete extends Command {
	static description = "Delete a root folder"

	static examples = ["<%= config.bin %> radarr rootfolders delete 1"]

	static args = {
		id: Args.integer({
			description: "Root folder ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrRootfoldersDelete)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const folders = await client.getRootFolders()
		const folder = folders.find((f) => f.id === args.id)

		await client.deleteRootFolder(args.id)

		if (flags.json) {
			this.log(JSON.stringify({ deleted: true, id: args.id }, null, 2))
			return
		}

		if (folder) {
			this.log(`✓ Deleted root folder: ${folder.path} (ID: ${args.id})`)
		} else {
			this.log(`✓ Deleted root folder ID: ${args.id}`)
		}
	}
}
