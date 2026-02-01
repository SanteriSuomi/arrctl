import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

interface CacheEntry<T> {
	data: T
	timestamp: number
}

type ServiceCache = Record<string, CacheEntry<unknown>>

export class ConfigCache {
	private cacheDir: string

	constructor() {
		this.cacheDir = join(homedir(), ".config", "arrctl", "cache")
	}

	private getCachePath(service: string): string {
		return join(this.cacheDir, `${service}.json`)
	}

	private readCache(service: string): ServiceCache {
		const path = this.getCachePath(service)
		if (!existsSync(path)) {
			return {}
		}
		try {
			return JSON.parse(readFileSync(path, "utf-8")) as ServiceCache
		} catch {
			return {}
		}
	}

	private writeCache(service: string, cache: ServiceCache): void {
		if (!existsSync(this.cacheDir)) {
			mkdirSync(this.cacheDir, { recursive: true })
		}
		writeFileSync(this.getCachePath(service), JSON.stringify(cache, null, "\t"))
	}

	async getOrFetch<T>(service: string, key: string, fetcher: () => Promise<T>): Promise<T> {
		const cache = this.readCache(service)
		const entry = cache[key] as CacheEntry<T> | undefined

		if (entry) {
			return entry.data
		}

		const data = await fetcher()
		cache[key] = { data, timestamp: Date.now() }
		this.writeCache(service, cache)
		return data
	}

	has(service: string, key: string): boolean {
		const cache = this.readCache(service)
		return key in cache
	}

	clear(service?: string): void {
		if (service) {
			const path = this.getCachePath(service)
			if (existsSync(path)) {
				rmSync(path)
			}
		} else {
			if (existsSync(this.cacheDir)) {
				rmSync(this.cacheDir, { recursive: true })
			}
		}
	}
}

export const configCache = new ConfigCache()
