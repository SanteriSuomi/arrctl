import { Args, Command, Flags } from "@oclif/core"

import { requireConfig } from "../../../lib/config"
import { formatTable } from "../../../lib/format"
import { RadarrClient } from "../../../lib/radarr/client"

export default class RadarrMoviesRename extends Command {
	static description = "Preview or execute file renames for a movie"

	static examples = [
		"<%= config.bin %> radarr movies rename 1",
		"<%= config.bin %> radarr movies rename 1 --execute",
	]

	static args = {
		id: Args.integer({
			description: "Movie ID",
			required: true,
		}),
	}

	static flags = {
		execute: Flags.boolean({ description: "Execute the rename (default is preview only)" }),
		json: Flags.boolean({ description: "Output as JSON" }),
	}

	async run(): Promise<void> {
		const { args, flags } = await this.parse(RadarrMoviesRename)
		const config = requireConfig("radarr")
		const client = new RadarrClient(config)

		const previews = await client.getRenamePreview(args.id)

		if (previews.length === 0) {
			if (flags.json) {
				this.log(JSON.stringify({ renames: [], message: "No renames needed" }, null, 2))
			} else {
				this.log("No renames needed for this movie")
			}
			return
		}

		if (flags.execute) {
			const fileIds = previews.map((p) => p.movieFileId)
			const command = await client.executeRename(args.id, fileIds)

			if (flags.json) {
				this.log(JSON.stringify(command, null, 2))
				return
			}

			this.log(`✓ Executed ${previews.length} rename(s) (Command ID: ${command.id})`)
			return
		}

		if (flags.json) {
			this.log(JSON.stringify(previews, null, 2))
			return
		}

		this.log("Rename Preview:")
		this.log("─".repeat(60))

		const table = formatTable(previews, [
			{ header: "File ID", get: (row) => String(row.movieFileId) },
			{ header: "Current", get: (row) => getFilename(row.existingPath) },
			{ header: "New", get: (row) => getFilename(row.newPath) },
		])
		this.log(table)

		this.log(`\nRun with --execute to apply ${previews.length} rename(s)`)
	}
}

function getFilename(path: string): string {
	return path.split(/[/\\]/).pop() ?? path
}
