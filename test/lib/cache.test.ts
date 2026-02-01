import { existsSync, rmSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ConfigCache } from "../../src/lib/cache"

describe("ConfigCache", () => {
	const testCacheDir = join(homedir(), ".config", "arrctl", "cache")

	beforeEach(() => {
		if (existsSync(testCacheDir)) {
			rmSync(testCacheDir, { recursive: true })
		}
	})

	afterEach(() => {
		if (existsSync(testCacheDir)) {
			rmSync(testCacheDir, { recursive: true })
		}
	})

	describe("getOrFetch", () => {
		it("should fetch and cache data when cache is empty", async () => {
			const cache = new ConfigCache()
			const fetcher = vi.fn().mockResolvedValue([{ id: 1, path: "/movies" }])

			const result = await cache.getOrFetch("radarr", "rootFolders", fetcher)

			expect(fetcher).toHaveBeenCalledOnce()
			expect(result).toEqual([{ id: 1, path: "/movies" }])
		})

		it("should return cached data without fetching", async () => {
			const cache = new ConfigCache()
			const fetcher = vi.fn().mockResolvedValue([{ id: 1, path: "/movies" }])

			await cache.getOrFetch("radarr", "rootFolders", fetcher)
			const result = await cache.getOrFetch("radarr", "rootFolders", fetcher)

			expect(fetcher).toHaveBeenCalledOnce()
			expect(result).toEqual([{ id: 1, path: "/movies" }])
		})

		it("should cache different keys separately", async () => {
			const cache = new ConfigCache()
			const folderFetcher = vi.fn().mockResolvedValue([{ id: 1, path: "/movies" }])
			const profileFetcher = vi.fn().mockResolvedValue([{ id: 1, name: "HD" }])

			await cache.getOrFetch("radarr", "rootFolders", folderFetcher)
			await cache.getOrFetch("radarr", "qualityProfiles", profileFetcher)

			expect(folderFetcher).toHaveBeenCalledOnce()
			expect(profileFetcher).toHaveBeenCalledOnce()
		})
	})

	describe("has", () => {
		it("should return false for non-existent cache", () => {
			const cache = new ConfigCache()
			expect(cache.has("radarr", "rootFolders")).toBe(false)
		})

		it("should return true for existing cache", async () => {
			const cache = new ConfigCache()
			await cache.getOrFetch("radarr", "rootFolders", async () => [])

			expect(cache.has("radarr", "rootFolders")).toBe(true)
		})
	})

	describe("clear", () => {
		it("should clear specific service cache", async () => {
			const cache = new ConfigCache()
			await cache.getOrFetch("radarr", "rootFolders", async () => [])
			await cache.getOrFetch("sonarr", "rootFolders", async () => [])

			cache.clear("radarr")

			expect(cache.has("radarr", "rootFolders")).toBe(false)
			expect(cache.has("sonarr", "rootFolders")).toBe(true)
		})

		it("should clear all caches when no service specified", async () => {
			const cache = new ConfigCache()
			await cache.getOrFetch("radarr", "rootFolders", async () => [])
			await cache.getOrFetch("sonarr", "rootFolders", async () => [])

			cache.clear()

			expect(cache.has("radarr", "rootFolders")).toBe(false)
			expect(cache.has("sonarr", "rootFolders")).toBe(false)
		})
	})
})
