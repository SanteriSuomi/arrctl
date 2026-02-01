import { Command, Flags } from "@oclif/core"

import { setConfig } from "../../../lib/config"
import { RADARR_DEFAULT_URL } from "../../../lib/constants"

export default class RadarrConfigSet extends Command {
	static description = "Configure Radarr connection"

	static examples = [
		`<%= config.bin %> radarr config set --url ${RADARR_DEFAULT_URL} --api-key abc123`,
	]

	static flags = {
		"api-key": Flags.string({ description: "Radarr API key", required: true }),
		url: Flags.string({ description: "Radarr URL", required: true }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrConfigSet)

		setConfig("radarr", {
			apiKey: flags["api-key"],
			url: flags.url,
		})

		this.log("Radarr configuration saved.")
	}
}
