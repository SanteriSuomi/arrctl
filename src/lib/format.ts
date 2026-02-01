export interface Column<T> {
	header: string
	get: (row: T) => string
}

export function formatTable<T>(data: T[], columns: Column<T>[]): string {
	if (data.length === 0) return ""

	const widths = columns.map((col) =>
		Math.max(col.header.length, ...data.map((row) => col.get(row).length)),
	)

	const header = columns.map((col, i) => col.header.padEnd(widths[i])).join("  ")
	const separator = widths.map((w) => "-".repeat(w)).join("  ")
	const rows = data.map((row) => columns.map((col, i) => col.get(row).padEnd(widths[i])).join("  "))

	return [header, separator, ...rows].join("\n")
}

export function formatSize(bytes: number): string {
	if (bytes === 0) return "-"
	const units = ["B", "KB", "MB", "GB", "TB"]
	const i = Math.floor(Math.log(bytes) / Math.log(1024))
	return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`
}
