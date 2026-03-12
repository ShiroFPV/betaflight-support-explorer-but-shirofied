<script lang="ts">
	import { Icon } from "@steeze-ui/svelte-icon"
	import { settings } from "$lib/stores/settings"
	import { previousIds } from "$lib/stores/previousIds"
	import { fly } from "svelte/transition"
	import { Trash, Copy, Check, Inbox } from "@steeze-ui/lucide-icons"
	import { writable } from "svelte/store"
	import { base } from "$app/paths"

	const description =
		"Easily explore all the data from support data submissions! Just paste the support key and get started."

	type DeletedItem = (typeof $previousIds)[number] & { originalIndex: number }
	const deletedItems = writable<DeletedItem[]>([])

	// Track copied IDs for visual feedback
	const copiedIds = writable<Set<string>>(new Set())

	function formatDate(timestamp: number) {
		return new Date(timestamp).toLocaleDateString("en-GB", {
			year: "numeric",
			month: "numeric",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric"
		})
	}

	function formatDateShort(timestamp: number) {
		return new Date(timestamp).toLocaleDateString("en-GB", {
			year: "numeric",
			month: "short",
			day: "numeric"
		})
	}

	function getSetting(name: string) {
		return $settings.idPreviewCardSettings.find((s) => s.name === name)?.value ?? false
	}

	function deleteId(id: string) {
		const itemToDelete = $previousIds.find((item) => item.id === id)
		if (itemToDelete) {
			const originalIndex = $previousIds.findIndex((item) => item.id === id)
			deletedItems.update((items) => [...items, { ...itemToDelete, originalIndex }])
			previousIds.update((items) => items.filter((item) => item.id !== id))
		}
	}

	function undoDelete() {
		deletedItems.update((items) => {
			if (items.length > 0) {
				const lastDeleted = items[items.length - 1]
				const { originalIndex, ...itemToRestore } = lastDeleted
				previousIds.update((current) => {
					const newItems = [...current]
					newItems.splice(originalIndex, 0, itemToRestore)
					return newItems
				})
				return items.slice(0, -1)
			}
			return items
		})
	}

	async function copyId(id: string) {
		try {
			await navigator.clipboard.writeText(id)
			copiedIds.update((s) => {
				const next = new Set(s)
				next.add(id)
				return next
			})
			setTimeout(() => {
				copiedIds.update((s) => {
					const next = new Set(s)
					next.delete(id)
					return next
				})
			}, 2000)
		} catch {
			// silently fail if clipboard not available
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key === "z") {
			event.preventDefault()
			undoDelete()
		}
	}

	let mostRecentDate = $derived(
		$previousIds.length > 0 ? Math.max(...$previousIds.map((id) => id.createdAt)) : null
	)
</script>

<svelte:head>
	<title>Betaflight Support Explorer | ShiroFPV</title>
	<meta name="description" content={description} />

	<meta property="og:title" content="Betaflight Support Explorer | ShiroFPV" />
	<meta property="og:url" content="https://shirofpv.dev/" />
	<meta property="og:type" content="website" />
	<meta property="og:description" content={description} />
	<meta name="theme-color" content="#b48bff" />
</svelte:head>

<svelte:document onkeydown={handleKeyDown} />

<div
	class="flex flex-col h-full w-full md:p-16 md:pt-8 p-4 pb-6 2xl:px-40 gap-6 relative overflow-hidden"
	in:fly={{ x: 500, duration: 400 }}
>
	<!-- Decorative floating orbs -->
	<div class="orb orb-purple w-96 h-96 -top-24 -left-24 opacity-50"></div>
	<div class="orb orb-pink w-64 h-64 top-1/3 -right-16 opacity-40"></div>
	<div class="orb orb-blue w-80 h-80 bottom-1/4 left-1/3 opacity-30"></div>

	<h1 class="gradient-text font-bold h1 lg:pt-24">Previous IDs</h1>

	<!-- Stats bar -->
	{#if $previousIds.length > 0}
		<div class="glass-card rounded-2xl px-5 py-3 flex gap-6 items-center text-sm w-fit animate-fade-in-up">
			<div class="flex items-center gap-2">
				<span class="text-primary-400 font-semibold">{$previousIds.length}</span>
				<span class="text-surface-300">saved ID{$previousIds.length !== 1 ? "s" : ""}</span>
			</div>
			{#if mostRecentDate}
				<div class="w-px h-4 bg-surface-500"></div>
				<div class="flex items-center gap-2">
					<span class="text-surface-300">Last:</span>
					<span class="text-tertiary-400">{formatDateShort(mostRecentDate)}</span>
				</div>
			{/if}
		</div>
	{/if}

	<div class="text-neutral-400 text-sm h-fit">
		Pick data to show in <a href="{base}/settings" class="fancy-link font-bold text-primary-500"
			>/settings</a
		>. IDs can be restored by pressing <span class="font-bold">Ctrl+Z</span>.
	</div>

	{#if $previousIds.length === 0}
		<!-- Empty state -->
		<div class="flex flex-col items-center justify-center py-24 gap-6 animate-fade-in-up">
			<div class="glass-card rounded-3xl p-8 flex flex-col items-center gap-4 text-center max-w-md">
				<div class="text-primary-400 opacity-60">
					<Icon src={Inbox} size="4rem" />
				</div>
				<h2 class="h3 font-bold text-surface-100">No saved IDs yet</h2>
				<p class="text-surface-300 text-sm leading-relaxed">
					Paste a Betaflight support ID in the search bar above to explore your configuration and
					detect potential issues. Your recent lookups will appear here.
				</p>
			</div>
		</div>
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
			{#each $previousIds as id (id.createdAt)}
				<div
					class="glass-card card-hover rounded-2xl group relative p-4 flex flex-col gap-4 animate-fade-in-up"
				>
					<!-- Delete button -->
					<div
						class="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 top-0 right-0 translate-x-1/2 -translate-y-1/2"
					>
						<button
							class="btn-icon preset-tonal-error border border-error-500 aspect-square p-3"
							onclick={() => deleteId(id.id)}
						>
							<Icon src={Trash} size="1.5rem" />
						</button>
					</div>

					<section class="card-header flex justify-between items-start gap-2">
						{#if getSetting("manufacturer") || getSetting("target")}
							<div class="flex gap-1 items-end min-w-0">
								{#if getSetting("manufacturer")}
									<span class="text-surface-200 text-base h-fit shrink-0"
										>{id.manufacturer}{getSetting("target") ? "/" : ""}</span
									>
								{/if}
								{#if getSetting("target")}
									<a
										href={base + "/" + id.id}
										class="text-primary-400 text-lg font-bold h-fit relative top-0.5 hover:underline truncate"
										data-sveltekit-preload-data="hover">{id.target}</a
									>
								{/if}
							</div>
						{/if}
						<div class="flex items-center gap-2 shrink-0">
							{#if getSetting("version")}
								<span class="text-surface-300 text-base h-fit">{id.version}</span>
							{/if}
							<!-- Copy button -->
							<button
								class="btn-icon text-surface-300 hover:text-primary-400 transition-colors p-1"
								onclick={() => copyId(id.id)}
								title="Copy support ID"
							>
								{#if $copiedIds.has(id.id)}
									<Icon src={Check} size="1rem" class="text-success-400" />
								{:else}
									<Icon src={Copy} size="1rem" />
								{/if}
							</button>
						</div>
					</section>

					<section class="flex flex-col gap-4">
						{#if getSetting("problemDescription")}
							<blockquote class="blockquote text-surface-200">
								{id.problemDescription || "No problem description provided"}
							</blockquote>
						{/if}
						{#if getSetting("armDisableFlags")}
							<div class="flex gap-2 flex-row flex-wrap max-h-16 overflow-y-auto">
								{#each id.armDisableFlags as flag, i (i)}
									<div class="badge preset-tonal-error border border-error-500">{flag}</div>
								{/each}
							</div>
						{/if}
						{#if getSetting("options")}
							<div class="flex gap-2 flex-row flex-wrap max-h-48 lg:max-h-24 overflow-y-auto">
								{#each id.options as option, i (i)}
									<div class="badge preset-tonal-primary">{option}</div>
								{/each}
							</div>
						{/if}
					</section>

					<section class="card-footer">
						{#if getSetting("createdAt")}
							<div class="flex gap-2">
								<div class="text-surface-300 text-sm h-fit">{formatDate(id.createdAt)}</div>
							</div>
						{/if}
					</section>
				</div>
			{/each}
		</div>
	{/if}
</div>
