import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../lib/config"
import { formatTable } from "../../../lib/format"
import { RadarrClient } from "../../../lib/radarr/client"

export default class RadarrSystemTasks extends Command {
	static description = "List or trigger scheduled tasks"

	static examples = [
		"<%= config.bin %> radarr system tasks",
		"<%= config.bin %> radarr system tasks --run RefreshMovie",
		"<%= config.bin %> radarr system tasks --run RssSync",
	]

	static args = {
		name: Args.string({
			description: "Task name to trigger (e.g., RefreshMovie, RssSync, Backup)",
			required: false,
		}),
	}

	static flags = {
		json: Flags.boolean({ description: "Output as JSON" }),
		run: Flags.string({ description: "Trigger a task by name" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrSystemTasks)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const taskName = flags.run || args.name
		if (taskName) {
			const result = await client.runTask(taskName)
			if (flags.json) {
				this.log(JSON.stringify(result, null, 2))
			} else {
				this.log(`✓ Triggered task: ${result.commandName} (ID: ${result.id})`)
			}
			return
		}

		const tasks = await client.getTasks()

		if (flags.json) {
			this.log(JSON.stringify(tasks, null, 2))
			return
		}

		if (tasks.length === 0) {
			this.log("No scheduled tasks")
			return
		}

		const table = formatTable(tasks, [
			{ header: "Name", get: (row) => row.taskName },
			{ header: "Interval", get: (row) => formatInterval(row.interval) },
			{ header: "Last Run", get: (row) => formatDate(row.lastExecution) },
			{ header: "Next Run", get: (row) => formatDate(row.nextExecution) },
			{ header: "Duration", get: (row) => row.lastDuration || "-" },
		])
		this.log(table)
	}
}

function formatInterval(minutes: number): string {
	if (minutes < 60) return `${minutes}m`
	if (minutes < 1440) return `${(minutes / 60).toFixed(0)}h`
	return `${(minutes / 1440).toFixed(0)}d`
}

function formatDate(iso: string): string {
	if (!iso) return "-"
	const date = new Date(iso)
	const now = new Date()
	const diff = (date.getTime() - now.getTime()) / 1000

	if (Math.abs(diff) < 60) return "now"
	if (diff > 0 && diff < 3600) return `in ${Math.floor(diff / 60)}m`
	if (diff < 0 && diff > -3600) return `${Math.floor(-diff / 60)}m ago`

	return date.toLocaleString()
}
