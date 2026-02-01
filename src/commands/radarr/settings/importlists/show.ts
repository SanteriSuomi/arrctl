import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config"
import { RadarrClient } from "../../../../lib/radarr/client"

export default class RadarrImportlistsShow extends Command {
	static description = "Show import list details"

	static examples = ["<%= config.bin %> radarr importlists show 1"]

	static args = {
		id: Args.integer({
			description: "Import list ID",
			required: true,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrImportlistsShow)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const list = await client.getImportList(args.id)

		if (flags.json) {
			this.log(JSON.stringify(list, null, 2))
			return
		}

		this.log(`Import List: ${list.name}`)
		this.log("─".repeat(40))
		this.log(`ID:           ${list.id}`)
		this.log(`Type:         ${list.implementationName}`)
		this.log(`Enabled:      ${list.enabled ? "Yes" : "No"}`)
		this.log(`Auto Add:     ${list.enableAuto ? "Yes" : "No"}`)
		this.log(`Monitor:      ${list.monitor}`)
		this.log(`Root Folder:  ${list.rootFolderPath}`)
		this.log(`Quality:      Profile ID ${list.qualityProfileId}`)
		this.log(`Availability: ${list.minimumAvailability}`)
		this.log(`Search:       ${list.searchOnAdd ? "Yes" : "No"}`)

		if (list.tags.length > 0) {
			this.log(`Tags:         ${list.tags.join(", ")}`)
		}

		const visibleFields = list.fields.filter((f) => f.hidden !== "hidden" && f.value !== null)
		if (visibleFields.length > 0) {
			this.log("\nConfiguration:")
			for (const field of visibleFields) {
				const value = field.privacy === "password" ? "********" : String(field.value ?? "")
				this.log(`  ${field.label}: ${value}`)
			}
		}
	}
}
