import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrDownloadclientsShow extends Command {
	static description = "Show download client details"

	static examples = ["<%= config.bin %> radarr downloadclients show 1"]

	static args = {
		id: Args.integer({
			description: "Download client ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrDownloadclientsShow)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const downloadClient = await client.getDownloadClient(args.id)

		if (flags.json) {
			this.log(JSON.stringify(downloadClient, null, 2))
			return
		}

		this.log(`Download Client: ${downloadClient.name}`)
		this.log("─".repeat(40))
		this.log(`ID:         ${downloadClient.id}`)
		this.log(`Type:       ${downloadClient.implementationName}`)
		this.log(`Protocol:   ${downloadClient.protocol}`)
		this.log(`Priority:   ${downloadClient.priority}`)
		this.log(`Enabled:    ${downloadClient.enable ? "Yes" : "No"}`)
		this.log(`Remove Completed: ${downloadClient.removeCompletedDownloads ? "Yes" : "No"}`)
		this.log(`Remove Failed:    ${downloadClient.removeFailedDownloads ? "Yes" : "No"}`)

		if (downloadClient.tags.length > 0) {
			this.log(`Tags:       ${downloadClient.tags.join(", ")}`)
		}

		const visibleFields = downloadClient.fields.filter(
			(f) => f.hidden !== "hidden" && f.value !== null,
		)
		if (visibleFields.length > 0) {
			this.log("\nConfiguration:")
			for (const field of visibleFields) {
				const value = field.privacy === "password" ? "********" : String(field.value ?? "")
				this.log(`  ${field.label}: ${value}`)
			}
		}
	}
}
