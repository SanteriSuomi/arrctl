import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { formatSize } from "../../../../lib/format"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrRootfoldersAdd extends Command {
	static description = "Add a new root folder"

	static examples = [
		"<%= config.bin %> radarr rootfolders add /movies",
		'<%= config.bin %> radarr rootfolders add "C:\\Movies"',
	]

	static args = {
		path: Args.string({
			description: "Path to the root folder",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrRootfoldersAdd)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const folder = await client.addRootFolder(args.path)

		if (flags.json) {
			this.log(JSON.stringify(folder, null, 2))
			return
		}

		this.log(`✓ Added root folder: ${folder.path}`)
		this.log(`  ID: ${folder.id}`)
		if (folder.freeSpace) {
			this.log(`  Free Space: ${formatSize(folder.freeSpace)}`)
		}
		this.log(`  Accessible: ${folder.accessible ? "Yes" : "No"}`)
	}
}
