import { Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../lib/config"
import { formatSize, formatTable } from "../../../lib/format"
import { RadarrClient } from "../../../lib/radarr/client"

export default class RadarrSystemStatus extends Command {
	static description = "Show system status, health, and disk space"

	static examples = [
		"<%= config.bin %> radarr system status",
		"<%= config.bin %> radarr system status --json",
	]

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(RadarrSystemStatus)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const [status, health, diskSpace] = await Promise.all([
			client.getSystemStatus(),
			client.getHealth(),
			client.getDiskSpace(),
		])

		if (flags.json) {
			this.log(JSON.stringify({ status, health, diskSpace }, null, 2))
			return
		}

		this.log("System Status")
		this.log("─".repeat(40))
		this.log(`Version:    ${status.version}`)
		this.log(`Branch:     ${status.branch}`)
		this.log(`OS:         ${status.osName} ${status.osVersion}`)
		this.log(`Runtime:    ${status.runtimeName} ${status.runtimeVersion}`)
		this.log(`Mode:       ${status.mode}`)
		this.log(`Docker:     ${status.isDocker ? "Yes" : "No"}`)
		this.log(`Start Time: ${new Date(status.startTime).toLocaleString()}`)

		if (health.length > 0) {
			this.log("\nHealth Checks")
			this.log("─".repeat(40))
			const healthTable = formatTable(health, [
				{ header: "Type", get: (row) => row.type },
				{ header: "Source", get: (row) => row.source },
				{ header: "Message", get: (row) => row.message },
			])
			this.log(healthTable)
		} else {
			this.log("\n✓ No health issues")
		}

		this.log("\nDisk Space")
		this.log("─".repeat(40))
		const diskTable = formatTable(diskSpace, [
			{ header: "Path", get: (row) => row.path },
			{ header: "Label", get: (row) => row.label || "-" },
			{ header: "Free", get: (row) => formatSize(row.freeSpace) },
			{ header: "Total", get: (row) => formatSize(row.totalSpace) },
			{
				header: "Used %",
				get: (row) => {
					const used = ((row.totalSpace - row.freeSpace) / row.totalSpace) * 100
					return `${used.toFixed(1)}%`
				},
			},
		])
		this.log(diskTable)
	}
}
