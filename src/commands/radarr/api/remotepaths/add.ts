import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrRemotepathsAdd extends Command {
	static description = "Add a remote path mapping"

	static examples = [
		'<%= config.bin %> radarr remotepaths add --host "download-client" --remote "/downloads" --local "/mnt/downloads"',
	]

	static flags = {
		host: Flags.string({ description: "Download client hostname", required: true }),
		remote: Flags.string({ description: "Remote path on download client", required: true }),
		local: Flags.string({ description: "Local path on Radarr server", required: true }),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrRemotepathsAdd)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const mapping = await client.addRemotePathMapping({
			host: flags.host,
			remotePath: flags.remote,
			localPath: flags.local,
		})

		if (flags.json) {
			this.log(JSON.stringify(mapping, null, 2))
			return
		}

		this.log(`✓ Added remote path mapping (ID: ${mapping.id})`)
		this.log(`  Host: ${mapping.host}`)
		this.log(`  Remote: ${mapping.remotePath}`)
		this.log(`  Local: ${mapping.localPath}`)
	}
}
