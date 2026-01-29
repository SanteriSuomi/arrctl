import {Command} from '@oclif/core'

import {getConfig} from '../../../lib/config.js'

export default class RadarrConfigShow extends Command {
  static description = 'Show Radarr configuration'

  static examples = ['<%= config.bin %> radarr config show']

  async run(): Promise<void> {
    await this.parse(RadarrConfigShow)
    const config = getConfig('radarr')

    if (!config) {
      this.log(`Radarr is not configured. Run:

  arrctl radarr config set --url <URL> --api-key <API_KEY>

Example:
  arrctl radarr config set --url http://localhost:7878 --api-key abc123`)
      return
    }

    this.log(`URL:     ${config.url}`)
    this.log(`API Key: ${config.apiKey.slice(0, 4)}${'*'.repeat(config.apiKey.length - 4)}`)
  }
}
