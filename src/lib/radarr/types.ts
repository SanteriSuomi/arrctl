// System types

export interface SystemStatus {
	appName: string
	instanceName: string
	version: string
	buildTime: string
	isDebug: boolean
	isProduction: boolean
	isAdmin: boolean
	isUserInteractive: boolean
	startupPath: string
	appData: string
	osName: string
	osVersion: string
	isNetCore: boolean
	isLinux: boolean
	isOsx: boolean
	isWindows: boolean
	isDocker: boolean
	mode: "console" | "service" | "tray"
	branch: string
	authentication: "none" | "basic" | "forms" | "external"
	urlBase: string
	runtimeVersion: string
	runtimeName: string
	startTime: string
	packageVersion: string
	packageAuthor: string
	packageUpdateMechanism: string
}

export interface DiskSpace {
	path: string
	label: string
	freeSpace: number
	totalSpace: number
}

export interface HealthCheck {
	source: string
	type: "ok" | "notice" | "warning" | "error"
	message: string
	wikiUrl?: string
}

export interface ScheduledTask {
	id: number
	name: string
	taskName: string
	interval: number
	lastExecution: string
	lastStartTime: string
	nextExecution: string
	lastDuration: string
}

export interface CommandResource {
	id: number
	name: string
	commandName: string
	message?: string
	body: Record<string, unknown>
	priority: "normal" | "high" | "low"
	status: "queued" | "started" | "completed" | "failed" | "aborted"
	result: "unknown" | "successful" | "unsuccessful"
	queued: string
	started?: string
	ended?: string
	duration?: string
	trigger: "unspecified" | "manual" | "scheduled"
	stateChangeTime?: string
	sendUpdatesToClient: boolean
	updateScheduledTask: boolean
	lastExecutionTime?: string
}

// Movie types

export interface MovieResource {
	id: number
	title: string
	originalTitle?: string
	sortTitle: string
	year: number
	tmdbId: number
	imdbId?: string
	overview?: string
	status: "announced" | "inCinemas" | "released" | "deleted"
	monitored: boolean
	minimumAvailability: "announced" | "inCinemas" | "released"
	hasFile: boolean
	path?: string
	qualityProfileId: number
	rootFolderPath?: string
	added: string
	runtime: number
	sizeOnDisk: number
	ratings?: {
		imdb?: { value: number }
		tmdb?: { value: number }
		rottenTomatoes?: { value: number }
	}
	genres?: string[]
	studio?: string
	tags: number[]
	images?: Array<{ coverType: string; url: string; remoteUrl?: string }>
	inCinemas?: string
	physicalRelease?: string
	digitalRelease?: string
}

export interface RootFolder {
	id: number
	path: string
	accessible: boolean
	freeSpace?: number
}

export interface QualityProfile {
	id: number
	name: string
}

export interface Tag {
	id: number
	label: string
}

export interface AddMovieOptions {
	monitor: "movieOnly" | "movieAndCollection" | "none"
	searchForMovie: boolean
}

export interface AddMoviePayload {
	title: string
	tmdbId: number
	year: number
	qualityProfileId: number
	rootFolderPath: string
	minimumAvailability: "announced" | "inCinemas" | "released"
	monitored: boolean
	tags: number[]
	addOptions: AddMovieOptions
}

export interface DeleteMovieOptions {
	deleteFiles?: boolean
	addImportExclusion?: boolean
}

export interface QueueRecord {
	id: number
	movieId: number
	title: string
	status: string
	trackedDownloadStatus?: string
	trackedDownloadState?: string
	statusMessages?: Array<{ title: string; messages: string[] }>
	errorMessage?: string
	downloadId?: string
	protocol: string
	downloadClient?: string
	indexer?: string
	outputPath?: string
	quality: { quality: { name: string } }
	size: number
	sizeleft: number
	timeleft?: string
	estimatedCompletionTime?: string
	added?: string
}

export interface HistoryRecord {
	id: number
	movieId: number
	sourceTitle: string
	quality: { quality: { name: string } }
	date: string
	eventType:
		| "grabbed"
		| "downloadFolderImported"
		| "downloadFailed"
		| "movieFileDeleted"
		| "movieFileRenamed"
	data: Record<string, string>
}

export interface BlocklistRecord {
	id: number
	movieId: number
	sourceTitle: string
	quality: { quality: { name: string } }
	date: string
	protocol: string
	indexer?: string
	message?: string
}

export interface PaginatedResponse<T> {
	page: number
	pageSize: number
	totalRecords: number
	records: T[]
}

// Config types

export interface NamingConfig {
	id: number
	renameMovies: boolean
	replaceIllegalCharacters: boolean
	colonReplacementFormat: "delete" | "dash" | "spaceDash" | "spaceDashSpace" | "smart"
	standardMovieFormat: string
	movieFolderFormat: string
}

export interface MediaManagementConfig {
	id: number
	autoUnmonitorPreviouslyDownloadedMovies: boolean
	recycleBin: string
	recycleBinCleanupDays: number
	downloadPropersAndRepacks: "preferAndUpgrade" | "doNotUpgrade" | "doNotPrefer"
	createEmptyMovieFolders: boolean
	deleteEmptyFolders: boolean
	fileDate: "none" | "cinemas" | "release"
	rescanAfterRefresh: "always" | "afterManual" | "never"
	autoRenameFolders: boolean
	setPermissionsLinux: boolean
	chmodFolder: string
	chownGroup: string
	skipFreeSpaceCheckWhenImporting: boolean
	minimumFreeSpaceWhenImporting: number
	copyUsingHardlinks: boolean
	useScriptImport: boolean
	scriptImportPath: string
	importExtraFiles: boolean
	extraFileExtensions: string
	enableMediaInfo: boolean
}

export interface HostConfig {
	id: number
	bindAddress: string
	port: number
	sslPort: number
	enableSsl: boolean
	urlBase: string
	instanceName: string
	applicationUrl: string
	authenticationMethod: "none" | "basic" | "forms" | "external"
	authenticationRequired: "enabled" | "disabledForLocalAddresses"
	username: string
	password: string
	certificateValidation: "enabled" | "disabledForLocalAddresses" | "disabled"
	proxyEnabled: boolean
	proxyType: "http" | "socks4" | "socks5"
	proxyHostname: string
	proxyPort: number
	proxyUsername: string
	proxyPassword: string
	proxyBypassFilter: string
	proxyBypassLocalAddresses: boolean
	logLevel: "info" | "debug" | "trace"
	logSizeLimit: number
	analyticsEnabled: boolean
	branch: string
	updateAutomatically: boolean
	updateMechanism: "builtIn" | "script" | "external" | "apt" | "docker"
	updateScriptPath: string
	backupFolder: string
	backupInterval: number
	backupRetention: number
	launchBrowser: boolean
	apiKey: string
	sslCertPath: string
	sslCertPassword: string
	consoleLogLevel: string
}

export interface IndexerConfig {
	id: number
	minimumAge: number
	retention: number
	maximumSize: number
	rssSyncInterval: number
	preferIndexerFlags: boolean
	availabilityDelay: number
	allowHardcodedSubs: boolean
	whitelistedHardcodedSubs: string
}

export interface DownloadClientConfig {
	id: number
	enableCompletedDownloadHandling: boolean
	checkForFinishedDownloadInterval: number
	autoRedownloadFailed: boolean
	autoRedownloadFailedFromInteractiveSearch: boolean
}

export interface ImportListConfig {
	id: number
	listSyncLevel: "disabled" | "logOnly" | "keepAndUnmonitor" | "removeAndKeep" | "removeAndDelete"
}

export interface UiConfig {
	id: number
	firstDayOfWeek: number
	calendarWeekColumnHeader: string
	movieRuntimeFormat: "hoursMinutes" | "minutes"
	shortDateFormat: string
	longDateFormat: string
	timeFormat: string
	showRelativeDates: boolean
	enableColorImpairedMode: boolean
	movieInfoLanguage: number
	uiLanguage: number
	theme: "auto" | "dark" | "light"
}

// Quality Profile types

export interface Quality {
	id: number
	name: string
	source: string
	resolution: number
	modifier: string
}

export interface Language {
	id: number
	name: string
}

export interface QualityProfileItem {
	id?: number
	name?: string
	quality?: Quality
	items?: QualityProfileItem[]
	allowed: boolean
}

export interface FormatItem {
	format: number
	name: string
	score: number
}

export interface QualityProfileFull {
	id: number
	name: string
	upgradeAllowed: boolean
	cutoff: number
	items: QualityProfileItem[]
	minFormatScore: number
	cutoffFormatScore: number
	formatItems: FormatItem[]
	language: Language
}

// Delay Profile types

export interface DelayProfile {
	id: number
	enableUsenet: boolean
	enableTorrent: boolean
	preferredProtocol: "usenet" | "torrent"
	usenetDelay: number
	torrentDelay: number
	bypassIfHighestQuality: boolean
	bypassIfAboveCustomFormatScore: boolean
	minimumCustomFormatScore: number
	order: number
	tags: number[]
}

// Quality Definition types

export interface QualityDefinition {
	id: number
	quality: Quality
	title: string
	weight: number
	minSize: number
	maxSize?: number
	preferredSize?: number
}

// Custom Format types

export interface SelectOption {
	value: number | string
	name: string
	order: number
	hint?: string
}

export interface ConfigField {
	order: number
	name: string
	label: string
	unit?: string
	helpText?: string
	helpTextWarning?: string
	helpLink?: string
	value: unknown
	type: string
	advanced: boolean
	selectOptions?: SelectOption[]
	selectOptionsProviderAction?: string
	section?: string
	hidden?: string
	privacy?: string
	placeholder?: string
	isFloat?: boolean
}

export interface CustomFormatSpecification {
	id?: number
	name: string
	implementation: string
	implementationName: string
	infoLink?: string
	negate: boolean
	required: boolean
	fields: ConfigField[]
}

export interface CustomFormat {
	id: number
	name: string
	includeCustomFormatWhenRenaming: boolean
	specifications: CustomFormatSpecification[]
}

// Provider base type (shared by indexers, download clients, import lists, notifications)

export interface ProviderResource {
	id: number
	name: string
	fields: ConfigField[]
	implementationName: string
	implementation: string
	configContract: string
	infoLink?: string
	tags: number[]
}

export interface ProviderSchema {
	id?: number
	name?: string
	fields: ConfigField[]
	implementationName: string
	implementation: string
	configContract: string
	infoLink?: string
	presets?: ProviderSchema[]
}

// Indexer types

export interface Indexer extends ProviderResource {
	enableRss: boolean
	enableAutomaticSearch: boolean
	enableInteractiveSearch: boolean
	supportsRss: boolean
	supportsSearch: boolean
	protocol: "usenet" | "torrent"
	priority: number
	downloadClientId: number
}

export type IndexerSchema = ProviderSchema

// Download Client types

export interface DownloadClientResource extends ProviderResource {
	enable: boolean
	protocol: "usenet" | "torrent"
	priority: number
	removeCompletedDownloads: boolean
	removeFailedDownloads: boolean
}

export type DownloadClientSchema = ProviderSchema

// Import List types

export interface ImportListResource extends ProviderResource {
	enabled: boolean
	enableAuto: boolean
	monitor: "movieOnly" | "movieAndCollection" | "none"
	rootFolderPath: string
	qualityProfileId: number
	minimumAvailability: "announced" | "inCinemas" | "released"
	searchOnAdd: boolean
	listType: string
	listOrder: number
}

export type ImportListSchema = ProviderSchema

// Import Exclusion types

export interface ImportExclusion {
	id: number
	tmdbId: number
	movieTitle: string
	movieYear: number
}

// Notification types

export interface NotificationResource extends ProviderResource {
	onGrab: boolean
	onDownload: boolean
	onUpgrade: boolean
	onRename: boolean
	onMovieAdded: boolean
	onMovieDelete: boolean
	onMovieFileDelete: boolean
	onMovieFileDeleteForUpgrade: boolean
	onHealthIssue: boolean
	onHealthRestored: boolean
	onApplicationUpdate: boolean
	onManualInteractionRequired: boolean
	supportsOnGrab: boolean
	supportsOnDownload: boolean
	supportsOnUpgrade: boolean
	supportsOnRename: boolean
	supportsOnMovieAdded: boolean
	supportsOnMovieDelete: boolean
	supportsOnMovieFileDelete: boolean
	supportsOnMovieFileDeleteForUpgrade: boolean
	supportsOnHealthIssue: boolean
	supportsOnHealthRestored: boolean
	supportsOnApplicationUpdate: boolean
	supportsOnManualInteractionRequired: boolean
	includeHealthWarnings: boolean
}

export type NotificationSchema = ProviderSchema

// Metadata Provider types

export interface MetadataResource extends ProviderResource {
	enable: boolean
}

export type MetadataSchema = ProviderSchema

// Remote Path Mapping types

export interface RemotePathMapping {
	id: number
	host: string
	remotePath: string
	localPath: string
}

// Action types

export interface RenamePreview {
	movieId: number
	movieFileId: number
	existingPath: string
	newPath: string
}

export interface ParseResult {
	title: string
	parsedMovieInfo?: {
		movieTitles: string[]
		year: number
		quality: { quality: { name: string } }
		languages: Language[]
		releaseGroup?: string
		edition?: string
	}
	movie?: MovieResource
}

// Bulk operation types

export interface MovieEditorPayload {
	movieIds: number[]
	monitored?: boolean
	qualityProfileId?: number
	minimumAvailability?: "announced" | "inCinemas" | "released"
	rootFolderPath?: string
	tags?: number[]
	applyTags?: "add" | "remove" | "replace"
	moveFiles?: boolean
	deleteFiles?: boolean
	addImportExclusion?: boolean
}

// Log types

export interface LogRecord {
	id: number
	time: string
	level: "trace" | "debug" | "info" | "warn" | "error" | "fatal"
	logger: string
	message: string
	exception?: string
	exceptionType?: string
}

// Backup types

export interface BackupInfo {
	id: number
	name: string
	path: string
	type: "scheduled" | "manual" | "update"
	size: number
	time: string
}

// Update types

export interface UpdateInfo {
	version: string
	branch: string
	releaseDate: string
	fileName: string
	url: string
	installed: boolean
	installable: boolean
	latest: boolean
	changes?: { version: string; changes: string }[]
}
