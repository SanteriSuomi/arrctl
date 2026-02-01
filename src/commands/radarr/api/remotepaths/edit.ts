import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrRemotepathsEdit extends Command {
	static description = "Edit a remote path mapping"

	static examples = [
		'<%= config.bin %> radarr api remotepaths edit 1 --local "/new/path"',
		'<%= config.bin %> radarr api remotepaths edit 1 --host "new-host"',
	]

	static args = {
		id: Args.integer({
			description: "Remote path mapping ID",
			required: true,
		}),
	}

	static flags = {
		host: Flags.string({ description: "Download client hostname" }),
		remote: Flags.string({ description: "Remote path on download client" }),
		local: Flags.string({ description: "Local path on Radarr server" }),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrRemotepathsEdit)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const mappings = await client.getRemotePathMappings()
		const mapping = mappings.find((m) => m.id === args.id)

		if (!mapping) {
			this.error(`Remote path mapping ${args.id} not found`)
		}

		if (flags.host) mapping.host = flags.host
		if (flags.remote) mapping.remotePath = flags.remote
		if (flags.local) mapping.localPath = flags.local

		const updated = await client.updateRemotePathMapping(mapping)

		if (flags.json) {
			this.log(JSON.stringify(updated, null, 2))
			return
		}

		this.log(`✓ Updated remote path mapping (ID: ${updated.id})`)
		this.log(`  Host: ${updated.host}`)
		this.log(`  Remote: ${updated.remotePath}`)
		this.log(`  Local: ${updated.localPath}`)
	}
}
