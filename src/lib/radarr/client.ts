import { configCache } from "../cache"
import type { ArrConfig } from "../types"
import type {
	AddMoviePayload,
	BackupInfo,
	BlocklistRecord,
	CommandResource,
	CustomFormat,
	DelayProfile,
	DeleteMovieOptions,
	DiskSpace,
	DownloadClientConfig,
	DownloadClientResource,
	DownloadClientSchema,
	HealthCheck,
	HistoryRecord,
	HostConfig,
	ImportExclusion,
	ImportListConfig,
	ImportListResource,
	ImportListSchema,
	Indexer,
	IndexerConfig,
	IndexerSchema,
	LogRecord,
	MediaManagementConfig,
	MetadataResource,
	MetadataSchema,
	MovieEditorPayload,
	MovieResource,
	NamingConfig,
	NotificationResource,
	NotificationSchema,
	PaginatedResponse,
	ParseResult,
	QualityDefinition,
	QualityProfile,
	QualityProfileFull,
	QueueRecord,
	RemotePathMapping,
	RenamePreview,
	RootFolder,
	ScheduledTask,
	SystemStatus,
	Tag,
	UiConfig,
	UpdateInfo,
} from "./types"

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

	async grabQueueItem(id: number): Promise<void> {
		return this.request<void>(`/queue/grab/${id}`, { method: "POST" })
	}

	async removeQueueItem(
		id: number,
		options?: { removeFromClient?: boolean; blocklist?: boolean },
	): Promise<void> {
		const params = new URLSearchParams()
		if (options?.removeFromClient) params.set("removeFromClient", "true")
		if (options?.blocklist) params.set("blocklist", "true")
		const query = params.toString() ? `?${params.toString()}` : ""
		return this.request<void>(`/queue/${id}${query}`, { method: "DELETE" })
	}

	async removeBlocklistItem(id: number): Promise<void> {
		return this.request<void>(`/blocklist/${id}`, { method: "DELETE" })
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

	async addTag(label: string): Promise<Tag> {
		configCache.clear("radarr")
		return this.request<Tag>("/tag", {
			method: "POST",
			body: JSON.stringify({ label }),
		})
	}

	async updateTag(tag: Tag): Promise<Tag> {
		configCache.clear("radarr")
		return this.request<Tag>(`/tag/${tag.id}`, {
			method: "PUT",
			body: JSON.stringify(tag),
		})
	}

	async deleteTag(id: number): Promise<void> {
		configCache.clear("radarr")
		return this.request<void>(`/tag/${id}`, { method: "DELETE" })
	}

	async addRootFolder(path: string): Promise<RootFolder> {
		configCache.clear("radarr")
		return this.request<RootFolder>("/rootfolder", {
			method: "POST",
			body: JSON.stringify({ path }),
		})
	}

	async deleteRootFolder(id: number): Promise<void> {
		configCache.clear("radarr")
		return this.request<void>(`/rootfolder/${id}`, { method: "DELETE" })
	}

	// System methods

	async getSystemStatus(): Promise<SystemStatus> {
		return this.request<SystemStatus>("/system/status")
	}

	async getDiskSpace(): Promise<DiskSpace[]> {
		return this.request<DiskSpace[]>("/diskspace")
	}

	async getHealth(): Promise<HealthCheck[]> {
		return this.request<HealthCheck[]>("/health")
	}

	async getTasks(): Promise<ScheduledTask[]> {
		return this.request<ScheduledTask[]>("/system/task")
	}

	async runTask(name: string): Promise<CommandResource> {
		return this.request<CommandResource>("/command", {
			method: "POST",
			body: JSON.stringify({ name }),
		})
	}

	// Quality Profiles

	async getQualityProfilesFull(): Promise<QualityProfileFull[]> {
		return this.request<QualityProfileFull[]>("/qualityprofile")
	}

	async getQualityProfile(id: number): Promise<QualityProfileFull> {
		return this.request<QualityProfileFull>(`/qualityprofile/${id}`)
	}

	async addQualityProfile(profile: Omit<QualityProfileFull, "id">): Promise<QualityProfileFull> {
		configCache.clear("radarr")
		return this.request<QualityProfileFull>("/qualityprofile", {
			method: "POST",
			body: JSON.stringify(profile),
		})
	}

	async updateQualityProfile(profile: QualityProfileFull): Promise<QualityProfileFull> {
		configCache.clear("radarr")
		return this.request<QualityProfileFull>(`/qualityprofile/${profile.id}`, {
			method: "PUT",
			body: JSON.stringify(profile),
		})
	}

	async deleteQualityProfile(id: number): Promise<void> {
		configCache.clear("radarr")
		return this.request<void>(`/qualityprofile/${id}`, { method: "DELETE" })
	}

	// Delay Profiles

	async getDelayProfiles(): Promise<DelayProfile[]> {
		return this.request<DelayProfile[]>("/delayprofile")
	}

	async getDelayProfile(id: number): Promise<DelayProfile> {
		return this.request<DelayProfile>(`/delayprofile/${id}`)
	}

	async addDelayProfile(profile: Omit<DelayProfile, "id">): Promise<DelayProfile> {
		return this.request<DelayProfile>("/delayprofile", {
			method: "POST",
			body: JSON.stringify(profile),
		})
	}

	async updateDelayProfile(profile: DelayProfile): Promise<DelayProfile> {
		return this.request<DelayProfile>(`/delayprofile/${profile.id}`, {
			method: "PUT",
			body: JSON.stringify(profile),
		})
	}

	async deleteDelayProfile(id: number): Promise<void> {
		return this.request<void>(`/delayprofile/${id}`, { method: "DELETE" })
	}

	// Quality Definitions

	async getQualityDefinitions(): Promise<QualityDefinition[]> {
		return this.request<QualityDefinition[]>("/qualitydefinition")
	}

	async updateQualityDefinition(definition: QualityDefinition): Promise<QualityDefinition> {
		return this.request<QualityDefinition>(`/qualitydefinition/${definition.id}`, {
			method: "PUT",
			body: JSON.stringify(definition),
		})
	}

	// Custom Formats

	async getCustomFormats(): Promise<CustomFormat[]> {
		return this.request<CustomFormat[]>("/customformat")
	}

	async getCustomFormat(id: number): Promise<CustomFormat> {
		return this.request<CustomFormat>(`/customformat/${id}`)
	}

	async addCustomFormat(format: Omit<CustomFormat, "id">): Promise<CustomFormat> {
		return this.request<CustomFormat>("/customformat", {
			method: "POST",
			body: JSON.stringify(format),
		})
	}

	async updateCustomFormat(format: CustomFormat): Promise<CustomFormat> {
		return this.request<CustomFormat>(`/customformat/${format.id}`, {
			method: "PUT",
			body: JSON.stringify(format),
		})
	}

	async deleteCustomFormat(id: number): Promise<void> {
		return this.request<void>(`/customformat/${id}`, { method: "DELETE" })
	}

	// Indexers

	async getIndexers(): Promise<Indexer[]> {
		return this.request<Indexer[]>("/indexer")
	}

	async getIndexer(id: number): Promise<Indexer> {
		return this.request<Indexer>(`/indexer/${id}`)
	}

	async getIndexerSchema(): Promise<IndexerSchema[]> {
		return this.request<IndexerSchema[]>("/indexer/schema")
	}

	async addIndexer(indexer: Omit<Indexer, "id">): Promise<Indexer> {
		return this.request<Indexer>("/indexer", {
			method: "POST",
			body: JSON.stringify(indexer),
		})
	}

	async updateIndexer(indexer: Indexer): Promise<Indexer> {
		return this.request<Indexer>(`/indexer/${indexer.id}`, {
			method: "PUT",
			body: JSON.stringify(indexer),
		})
	}

	async deleteIndexer(id: number): Promise<void> {
		return this.request<void>(`/indexer/${id}`, { method: "DELETE" })
	}

	async testIndexer(indexer: Partial<Indexer>): Promise<void> {
		return this.request<void>("/indexer/test", {
			method: "POST",
			body: JSON.stringify(indexer),
		})
	}

	// Download Clients

	async getDownloadClients(): Promise<DownloadClientResource[]> {
		return this.request<DownloadClientResource[]>("/downloadclient")
	}

	async getDownloadClient(id: number): Promise<DownloadClientResource> {
		return this.request<DownloadClientResource>(`/downloadclient/${id}`)
	}

	async getDownloadClientSchema(): Promise<DownloadClientSchema[]> {
		return this.request<DownloadClientSchema[]>("/downloadclient/schema")
	}

	async addDownloadClient(
		client: Omit<DownloadClientResource, "id">,
	): Promise<DownloadClientResource> {
		return this.request<DownloadClientResource>("/downloadclient", {
			method: "POST",
			body: JSON.stringify(client),
		})
	}

	async updateDownloadClient(client: DownloadClientResource): Promise<DownloadClientResource> {
		return this.request<DownloadClientResource>(`/downloadclient/${client.id}`, {
			method: "PUT",
			body: JSON.stringify(client),
		})
	}

	async deleteDownloadClient(id: number): Promise<void> {
		return this.request<void>(`/downloadclient/${id}`, { method: "DELETE" })
	}

	async testDownloadClient(client: Partial<DownloadClientResource>): Promise<void> {
		return this.request<void>("/downloadclient/test", {
			method: "POST",
			body: JSON.stringify(client),
		})
	}

	// Import Lists

	async getImportLists(): Promise<ImportListResource[]> {
		return this.request<ImportListResource[]>("/importlist")
	}

	async getImportList(id: number): Promise<ImportListResource> {
		return this.request<ImportListResource>(`/importlist/${id}`)
	}

	async getImportListSchema(): Promise<ImportListSchema[]> {
		return this.request<ImportListSchema[]>("/importlist/schema")
	}

	async addImportList(list: Omit<ImportListResource, "id">): Promise<ImportListResource> {
		return this.request<ImportListResource>("/importlist", {
			method: "POST",
			body: JSON.stringify(list),
		})
	}

	async updateImportList(list: ImportListResource): Promise<ImportListResource> {
		return this.request<ImportListResource>(`/importlist/${list.id}`, {
			method: "PUT",
			body: JSON.stringify(list),
		})
	}

	async deleteImportList(id: number): Promise<void> {
		return this.request<void>(`/importlist/${id}`, { method: "DELETE" })
	}

	async testImportList(list: Partial<ImportListResource>): Promise<void> {
		return this.request<void>("/importlist/test", {
			method: "POST",
			body: JSON.stringify(list),
		})
	}

	// Import Exclusions

	async getExclusions(): Promise<ImportExclusion[]> {
		return this.request<ImportExclusion[]>("/exclusions")
	}

	async addExclusion(exclusion: Omit<ImportExclusion, "id">): Promise<ImportExclusion> {
		return this.request<ImportExclusion>("/exclusions", {
			method: "POST",
			body: JSON.stringify(exclusion),
		})
	}

	async deleteExclusion(id: number): Promise<void> {
		return this.request<void>(`/exclusions/${id}`, { method: "DELETE" })
	}

	// Notifications

	async getNotifications(): Promise<NotificationResource[]> {
		return this.request<NotificationResource[]>("/notification")
	}

	async getNotification(id: number): Promise<NotificationResource> {
		return this.request<NotificationResource>(`/notification/${id}`)
	}

	async getNotificationSchema(): Promise<NotificationSchema[]> {
		return this.request<NotificationSchema[]>("/notification/schema")
	}

	async addNotification(
		notification: Omit<NotificationResource, "id">,
	): Promise<NotificationResource> {
		return this.request<NotificationResource>("/notification", {
			method: "POST",
			body: JSON.stringify(notification),
		})
	}

	async updateNotification(notification: NotificationResource): Promise<NotificationResource> {
		return this.request<NotificationResource>(`/notification/${notification.id}`, {
			method: "PUT",
			body: JSON.stringify(notification),
		})
	}

	async deleteNotification(id: number): Promise<void> {
		return this.request<void>(`/notification/${id}`, { method: "DELETE" })
	}

	async testNotification(notification: Partial<NotificationResource>): Promise<void> {
		return this.request<void>("/notification/test", {
			method: "POST",
			body: JSON.stringify(notification),
		})
	}

	// Movie Actions

	async refreshMovie(movieId: number): Promise<CommandResource> {
		return this.request<CommandResource>("/command", {
			method: "POST",
			body: JSON.stringify({ name: "RefreshMovie", movieIds: [movieId] }),
		})
	}

	async searchMovie(movieId: number): Promise<CommandResource> {
		return this.request<CommandResource>("/command", {
			method: "POST",
			body: JSON.stringify({ name: "MoviesSearch", movieIds: [movieId] }),
		})
	}

	async getRenamePreview(movieId: number): Promise<RenamePreview[]> {
		return this.request<RenamePreview[]>(`/rename?movieId=${movieId}`)
	}

	async executeRename(movieId: number, fileIds: number[]): Promise<CommandResource> {
		return this.request<CommandResource>("/command", {
			method: "POST",
			body: JSON.stringify({ name: "RenameFiles", movieId, files: fileIds }),
		})
	}

	async parseRelease(title: string): Promise<ParseResult> {
		return this.request<ParseResult>(`/parse?title=${encodeURIComponent(title)}`)
	}

	// Bulk Operations

	async bulkEditMovies(payload: MovieEditorPayload): Promise<MovieResource[]> {
		return this.request<MovieResource[]>("/movie/editor", {
			method: "PUT",
			body: JSON.stringify(payload),
		})
	}

	async bulkDeleteMovies(
		movieIds: number[],
		deleteFiles = false,
		addExclusion = false,
	): Promise<void> {
		return this.request<void>("/movie/editor", {
			method: "DELETE",
			body: JSON.stringify({ movieIds, deleteFiles, addImportExclusion: addExclusion }),
		})
	}

	// Metadata Providers

	async getMetadataProviders(): Promise<MetadataResource[]> {
		return this.request<MetadataResource[]>("/metadata")
	}

	async getMetadataProvider(id: number): Promise<MetadataResource> {
		return this.request<MetadataResource>(`/metadata/${id}`)
	}

	async getMetadataSchema(): Promise<MetadataSchema[]> {
		return this.request<MetadataSchema[]>("/metadata/schema")
	}

	async addMetadataProvider(provider: Omit<MetadataResource, "id">): Promise<MetadataResource> {
		return this.request<MetadataResource>("/metadata", {
			method: "POST",
			body: JSON.stringify(provider),
		})
	}

	async updateMetadataProvider(provider: MetadataResource): Promise<MetadataResource> {
		return this.request<MetadataResource>(`/metadata/${provider.id}`, {
			method: "PUT",
			body: JSON.stringify(provider),
		})
	}

	async deleteMetadataProvider(id: number): Promise<void> {
		return this.request<void>(`/metadata/${id}`, { method: "DELETE" })
	}

	// Remote Path Mappings

	async getRemotePathMappings(): Promise<RemotePathMapping[]> {
		return this.request<RemotePathMapping[]>("/remotepathmapping")
	}

	async addRemotePathMapping(mapping: Omit<RemotePathMapping, "id">): Promise<RemotePathMapping> {
		return this.request<RemotePathMapping>("/remotepathmapping", {
			method: "POST",
			body: JSON.stringify(mapping),
		})
	}

	async updateRemotePathMapping(mapping: RemotePathMapping): Promise<RemotePathMapping> {
		return this.request<RemotePathMapping>(`/remotepathmapping/${mapping.id}`, {
			method: "PUT",
			body: JSON.stringify(mapping),
		})
	}

	async deleteRemotePathMapping(id: number): Promise<void> {
		return this.request<void>(`/remotepathmapping/${id}`, { method: "DELETE" })
	}

	// Logs

	async getLogs(page = 1, pageSize = 50): Promise<PaginatedResponse<LogRecord>> {
		return this.request<PaginatedResponse<LogRecord>>(
			`/log?page=${page}&pageSize=${pageSize}&sortKey=time&sortDirection=descending`,
		)
	}

	// Backups

	async getBackups(): Promise<BackupInfo[]> {
		return this.request<BackupInfo[]>("/system/backup")
	}

	async createBackup(): Promise<BackupInfo> {
		return this.request<BackupInfo>("/command", {
			method: "POST",
			body: JSON.stringify({ name: "Backup" }),
		})
	}

	async restoreBackup(id: number): Promise<void> {
		return this.request<void>(`/system/backup/restore/${id}`, { method: "POST" })
	}

	async deleteBackup(id: number): Promise<void> {
		return this.request<void>(`/system/backup/${id}`, { method: "DELETE" })
	}

	// Updates

	async getUpdates(): Promise<UpdateInfo[]> {
		return this.request<UpdateInfo[]>("/update")
	}

	async installUpdate(): Promise<CommandResource> {
		return this.request<CommandResource>("/command", {
			method: "POST",
			body: JSON.stringify({ name: "ApplicationUpdate" }),
		})
	}

	// Config methods

	async getNamingConfig(): Promise<NamingConfig> {
		return this.request<NamingConfig>("/config/naming")
	}

	async updateNamingConfig(config: NamingConfig): Promise<NamingConfig> {
		return this.request<NamingConfig>(`/config/naming/${config.id}`, {
			method: "PUT",
			body: JSON.stringify(config),
		})
	}

	async getMediaManagementConfig(): Promise<MediaManagementConfig> {
		return this.request<MediaManagementConfig>("/config/mediamanagement")
	}

	async updateMediaManagementConfig(config: MediaManagementConfig): Promise<MediaManagementConfig> {
		return this.request<MediaManagementConfig>(`/config/mediamanagement/${config.id}`, {
			method: "PUT",
			body: JSON.stringify(config),
		})
	}

	async getHostConfig(): Promise<HostConfig> {
		return this.request<HostConfig>("/config/host")
	}

	async updateHostConfig(config: HostConfig): Promise<HostConfig> {
		return this.request<HostConfig>(`/config/host/${config.id}`, {
			method: "PUT",
			body: JSON.stringify(config),
		})
	}

	async getIndexerConfig(): Promise<IndexerConfig> {
		return this.request<IndexerConfig>("/config/indexer")
	}

	async updateIndexerConfig(config: IndexerConfig): Promise<IndexerConfig> {
		return this.request<IndexerConfig>(`/config/indexer/${config.id}`, {
			method: "PUT",
			body: JSON.stringify(config),
		})
	}

	async getDownloadClientConfig(): Promise<DownloadClientConfig> {
		return this.request<DownloadClientConfig>("/config/downloadclient")
	}

	async updateDownloadClientConfig(config: DownloadClientConfig): Promise<DownloadClientConfig> {
		return this.request<DownloadClientConfig>(`/config/downloadclient/${config.id}`, {
			method: "PUT",
			body: JSON.stringify(config),
		})
	}

	async getImportListConfig(): Promise<ImportListConfig> {
		return this.request<ImportListConfig>("/config/importlist")
	}

	async updateImportListConfig(config: ImportListConfig): Promise<ImportListConfig> {
		return this.request<ImportListConfig>(`/config/importlist/${config.id}`, {
			method: "PUT",
			body: JSON.stringify(config),
		})
	}

	async getUiConfig(): Promise<UiConfig> {
		return this.request<UiConfig>("/config/ui")
	}

	async updateUiConfig(config: UiConfig): Promise<UiConfig> {
		return this.request<UiConfig>(`/config/ui/${config.id}`, {
			method: "PUT",
			body: JSON.stringify(config),
		})
	}
}
