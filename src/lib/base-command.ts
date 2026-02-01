import { Command } from "@oclif/core"

export abstract class BaseSettingsCommand extends Command {
	protected outputResult(result: unknown, successMessage: string, json?: boolean): void {
		this.log(json ? JSON.stringify(result, null, 2) : successMessage)
	}

	protected outputNoChanges(current: unknown, json?: boolean): void {
		this.log(json ? JSON.stringify(current, null, 2) : "Use --help for usage information")
	}
}
