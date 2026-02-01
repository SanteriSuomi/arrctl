import { configCache } from "../cache.js"
import type { ArrConfig } from "../types.js"
import type {
	AddMoviePayload,
	BlocklistRecord,
	DeleteMovieOptions,
	HistoryRecord,
	MovieResource,
	PaginatedResponse,
	QualityProfile,
	QueueRecord,
	RootFolder,
	Tag,
} from "./types.js"

export class RadarrClient {
	private baseUrl: string
	private apiKey: string

	constructor(config: ArrConfig) {
		this.baseUrl = config.url.replace(/\/$/, "")
		this.apiKey = config.apiKey
	}

	private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
		const url = `${this.baseUrl}/api/v3${endpoint}`
		const response = await fetch(url, {
			...options,
			headers: {
				"X-Api-Key": this.apiKey,
				"Content-Type": "application/json",
				...options?.headers,
			},
		})

		if (!response.ok) {
			const text = await response.text()
			throw new Error(`Radarr API error: ${response.status} ${response.statusText} - ${text}`)
		}

		const text = await response.text()
		if (!text || response.status === 204) {
			return undefined as T
		}

		return JSON.parse(text) as T
	}

	async lookupByTmdb(tmdbId: number): Promise<MovieResource> {
		return this.request<MovieResource>(`/movie/lookup/tmdb?tmdbId=${tmdbId}`)
	}

	async lookupByImdb(imdbId: string): Promise<MovieResource> {
		return this.request<MovieResource>(`/movie/lookup/imdb?imdbId=${encodeURIComponent(imdbId)}`)
	}

	async searchMovies(term: string): Promise<MovieResource[]> {
		return this.request<MovieResource[]>(`/movie/lookup?term=${encodeURIComponent(term)}`)
	}

	async getMovies(): Promise<MovieResource[]> {
		return this.request<MovieResource[]>("/movie")
	}

	async getMovie(id: number): Promise<MovieResource> {
		return this.request<MovieResource>(`/movie/${id}`)
	}

	async addMovie(payload: AddMoviePayload): Promise<MovieResource> {
		return this.request<MovieResource>("/movie", {
			method: "POST",
			body: JSON.stringify(payload),
		})
	}

	async deleteMovie(id: number, options?: DeleteMovieOptions): Promise<void> {
		const params = new URLSearchParams()
		if (options?.deleteFiles) params.set("deleteFiles", "true")
		if (options?.addImportExclusion) params.set("addImportExclusion", "true")
		const query = params.toString() ? `?${params.toString()}` : ""
		return this.request<void>(`/movie/${id}${query}`, { method: "DELETE" })
	}

	async getCalendar(start: Date, end: Date, unmonitored = false): Promise<MovieResource[]> {
		const params = new URLSearchParams({
			start: start.toISOString(),
			end: end.toISOString(),
			unmonitored: String(unmonitored),
		})
		return this.request<MovieResource[]>(`/calendar?${params.toString()}`)
	}

	async getQueue(page = 1, pageSize = 20): Promise<PaginatedResponse<QueueRecord>> {
		return this.request<PaginatedResponse<QueueRecord>>(`/queue?page=${page}&pageSize=${pageSize}`)
	}

	async getHistory(page = 1, pageSize = 20): Promise<PaginatedResponse<HistoryRecord>> {
		return this.request<PaginatedResponse<HistoryRecord>>(
			`/history?page=${page}&pageSize=${pageSize}&sortKey=date&sortDirection=descending`,
		)
	}

	async getBlocklist(page = 1, pageSize = 20): Promise<PaginatedResponse<BlocklistRecord>> {
		return this.request<PaginatedResponse<BlocklistRecord>>(
			`/blocklist?page=${page}&pageSize=${pageSize}`,
		)
	}

	async getMissing(page = 1, pageSize = 20): Promise<PaginatedResponse<MovieResource>> {
		return this.request<PaginatedResponse<MovieResource>>(
			`/wanted/missing?page=${page}&pageSize=${pageSize}&sortKey=title&sortDirection=ascending`,
		)
	}

	async getCutoffUnmet(page = 1, pageSize = 20): Promise<PaginatedResponse<MovieResource>> {
		return this.request<PaginatedResponse<MovieResource>>(
			`/wanted/cutoff?page=${page}&pageSize=${pageSize}&sortKey=title&sortDirection=ascending`,
		)
	}

	async getRootFolders(): Promise<RootFolder[]> {
		return configCache.getOrFetch("radarr", "rootFolders", () =>
			this.request<RootFolder[]>("/rootfolder"),
		)
	}

	async getQualityProfiles(): Promise<QualityProfile[]> {
		return configCache.getOrFetch("radarr", "qualityProfiles", () =>
			this.request<QualityProfile[]>("/qualityprofile"),
		)
	}

	async getTags(): Promise<Tag[]> {
		return configCache.getOrFetch("radarr", "tags", () => this.request<Tag[]>("/tag"))
	}
}
