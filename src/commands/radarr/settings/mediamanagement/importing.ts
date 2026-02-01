import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config.js"
import { RadarrClient } from "../../../../lib/radarr/client.js"

export default class SettingsMediaManagementImporting extends Command {
	static description = "Import settings"

	static examples = [
		"<%= config.bin %> radarr settings mediamanagement importing --use-hardlinks",
		"<%= config.bin %> radarr settings mediamanagement importing --minimum-free-space 500",
		"<%= config.bin %> radarr settings mediamanagement importing --import-extra-files --extra-file-extensions srt,sub",
	]

	static flags = {
		"extra-file-extensions": Flags.string({ description: "Extra file extensions to import" }),
		"import-extra-files": Flags.boolean({
			description: "Import matching extra files (subtitles, nfo, etc)",
			allowNo: true,
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
		"minimum-free-space": Flags.integer({ description: "Minimum free space in MB" }),
		"script-import-path": Flags.string({ description: "Script import path" }),
		"skip-free-space-check": Flags.boolean({
			description: "Skip free space check when importing",
			allowNo: true,
		}),
		"use-hardlinks": Flags.boolean({
			description: "Use hardlinks instead of copy",
			allowNo: true,
		}),
		"use-script-import": Flags.boolean({
			description: "Use script for importing",
			allowNo: true,
		}),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsMediaManagementImporting)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getMediaManagementConfig()

		const hasChanges =
			flags["skip-free-space-check"] !== undefined ||
			flags["minimum-free-space"] !== undefined ||
			flags["use-hardlinks"] !== undefined ||
			flags["import-extra-files"] !== undefined ||
			flags["extra-file-extensions"] !== undefined ||
			flags["use-script-import"] !== undefined ||
			flags["script-import-path"] !== undefined

		if (!hasChanges) {
			if (flags.json) {
				this.log(JSON.stringify(current, null, 2))
			} else {
				this.log("Use --help for usage information")
			}
			return
		}

		const updated = { ...current }

		if (flags["skip-free-space-check"] !== undefined) {
			updated.skipFreeSpaceCheckWhenImporting = flags["skip-free-space-check"]
		}
		if (flags["minimum-free-space"] !== undefined) {
			updated.minimumFreeSpaceWhenImporting = flags["minimum-free-space"]
		}
		if (flags["use-hardlinks"] !== undefined) {
			updated.copyUsingHardlinks = flags["use-hardlinks"]
		}
		if (flags["import-extra-files"] !== undefined) {
			updated.importExtraFiles = flags["import-extra-files"]
		}
		if (flags["extra-file-extensions"] !== undefined) {
			updated.extraFileExtensions = flags["extra-file-extensions"]
		}
		if (flags["use-script-import"] !== undefined) {
			updated.useScriptImport = flags["use-script-import"]
		}
		if (flags["script-import-path"] !== undefined) {
			updated.scriptImportPath = flags["script-import-path"]
		}

		const result = await client.updateMediaManagementConfig(updated)

		if (flags.json) {
			this.log(JSON.stringify(result, null, 2))
		} else {
			this.log("✓ Import settings updated")
		}
	}
}
