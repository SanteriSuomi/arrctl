import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../../lib/config.js"
import { RadarrClient } from "../../../../lib/radarr/client.js"

export default class SettingsMediaManagementFileManagement extends Command {
	static description = "File management settings"

	static examples = [
		"<%= config.bin %> radarr settings mediamanagement filemanagement --unmonitor-deleted",
		"<%= config.bin %> radarr settings mediamanagement filemanagement --propers-and-repacks preferAndUpgrade",
		"<%= config.bin %> radarr settings mediamanagement filemanagement --recycle-bin /path/to/recycle",
	]

	static flags = {
		"analyze-video-files": Flags.boolean({
			description: "Extract video information from files",
			allowNo: true,
		}),
		"change-file-date": Flags.string({
			description: "Change file date on import/rescan",
			options: ["none", "cinemas", "release"],
		}),
		json: Flags.boolean({ description: "Output as JSON" }),
		"propers-and-repacks": Flags.string({
			description: "Propers and repacks handling",
			options: ["preferAndUpgrade", "doNotUpgrade", "doNotPrefer"],
		}),
		"recycle-bin": Flags.string({ description: "Recycling bin path" }),
		"recycle-bin-cleanup": Flags.integer({
			description: "Recycle bin cleanup days (0 to disable)",
		}),
		"rescan-after-refresh": Flags.string({
			description: "Rescan movie folder after refresh",
			options: ["always", "afterManual", "never"],
		}),
		"unmonitor-deleted": Flags.boolean({
			description: "Unmonitor movies deleted from disk",
			allowNo: true,
		}),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(SettingsMediaManagementFileManagement)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const current = await client.getMediaManagementConfig()

		const hasChanges =
			flags["unmonitor-deleted"] !== undefined ||
			flags["propers-and-repacks"] !== undefined ||
			flags["analyze-video-files"] !== undefined ||
			flags["rescan-after-refresh"] !== undefined ||
			flags["change-file-date"] !== undefined ||
			flags["recycle-bin"] !== undefined ||
			flags["recycle-bin-cleanup"] !== undefined

		if (!hasChanges) {
			if (flags.json) {
				this.log(JSON.stringify(current, null, 2))
			} else {
				this.log("Use --help for usage information")
			}
			return
		}

		const updated = { ...current }

		if (flags["unmonitor-deleted"] !== undefined) {
			updated.autoUnmonitorPreviouslyDownloadedMovies = flags["unmonitor-deleted"]
		}
		if (flags["propers-and-repacks"] !== undefined) {
			updated.downloadPropersAndRepacks = flags[
				"propers-and-repacks"
			] as typeof current.downloadPropersAndRepacks
		}
		if (flags["analyze-video-files"] !== undefined) {
			updated.enableMediaInfo = flags["analyze-video-files"]
		}
		if (flags["rescan-after-refresh"] !== undefined) {
			updated.rescanAfterRefresh = flags[
				"rescan-after-refresh"
			] as typeof current.rescanAfterRefresh
		}
		if (flags["change-file-date"] !== undefined) {
			updated.fileDate = flags["change-file-date"] as typeof current.fileDate
		}
		if (flags["recycle-bin"] !== undefined) {
			updated.recycleBin = flags["recycle-bin"]
		}
		if (flags["recycle-bin-cleanup"] !== undefined) {
			updated.recycleBinCleanupDays = flags["recycle-bin-cleanup"]
		}

		const result = await client.updateMediaManagementConfig(updated)

		if (flags.json) {
			this.log(JSON.stringify(result, null, 2))
		} else {
			this.log("✓ File management settings updated")
		}
	}
}
