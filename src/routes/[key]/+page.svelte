<script lang="ts">
	import type { PageData } from "./$types"
	import { Icon } from "@steeze-ui/svelte-icon"
	import { Download, BookOpen, FileScan, Github } from "@steeze-ui/lucide-icons"
	import { Accordion } from "@skeletonlabs/skeleton-svelte"
	import { fly } from "svelte/transition"
	import Ports from "$components/Ports.svelte"
	import Modes from "$components/Modes.svelte"
	import ProblemDetector from "$components/ProblemDetector.svelte"
	import { page } from "$app/state"
	import CodeBlock from "$components/CodeBlock/CodeBlock.svelte"
	import { extractDump } from "$lib/extract"
	import { settings } from "$lib/stores/settings"
	import { base } from "$app/paths"

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()

	type CommonSettings = {
		[section: string]: {
			[setting: string]: {
				name: string
				value: string
			}
		}
	}

	let { build, status, problem, dma, timer, serial, modes, detectedProblems, description, support } =
		$derived(data)
	let commonSettings = $derived(data.commonSettings as CommonSettings)

	// Extract dump based on showFullText setting
	let dump = $derived(support ? extractDump(support, $settings.showFullText) : null)
	let config = $derived(build?.config)
	let request = $derived(build?.request)

	// Calculate PID Rate from gyro rate and pidDenom
	let pidRate = $derived(
		(() => {
			if (!status || !commonSettings?.["Denominations"]?.["pidDenom"]?.value) return null
			const gyroRate = parseFloat(status["GYRO rate"] as string)
			const pidDenom = parseFloat(commonSettings["Denominations"]["pidDenom"].value)
			if (isNaN(gyroRate) || isNaN(pidDenom) || pidDenom === 0) return null
			return Math.round(gyroRate / pidDenom)
		})()
	)

	let ArmingDisableFlags = $derived((status?.["Arming disable flags"] as string)?.split(" ") ?? [])

	let timerKeys = $derived(timer ? Object.keys(timer) : [])
	let timerHalf = $derived(Math.ceil(timerKeys.length / 2))
	let splitTimer = $derived([
		timerKeys.slice(0, timerHalf),
		timerKeys.slice(timerHalf, timerKeys.length)
	])

	function formatTime(time: string) {
		return (
			time.slice(8, 10) + "." + time.slice(5, 7) + "." + time.slice(0, 4) + " " + time.slice(11, 23)
		)
	}
</script>

<svelte:head>
	<title>{"Betaflight Support Explorer | ShiroFPV" + " - " + page.params.key}</title>
	<meta name="description" content={description} />

	<meta
		property="og:title"
		content={config?.target ? `Support Data for ${config.target} | ShiroFPV` : "Betaflight Support Explorer | ShiroFPV"}
	/>
	<meta property="og:url" content="https://shirofpv.dev/" />
	<meta property="og:type" content="website" />
	<meta property="og:description" content={description} />
	<meta name="theme-color" content="#b48bff" />
</svelte:head>

<div
	class="flex flex-col h-full max-w-screen md:p-16 md:pt-8 lg:p-4 p-2 pb-6 2xl:px-40 gap-6 relative"
	in:fly={{ x: 500, duration: 400 }}
>
	{#if detectedProblems}
		<ProblemDetector problems={detectedProblems} />
	{/if}

	{#if !build}
		<div class="glass-card rounded-2xl p-4 flex flex-col gap-2 border border-warning-500/30">
			<header class="card-header text-warning-500 h3 font-bold">Locally Built Firmware</header>
			<p class="text-base">No Cloud Build Key found. Build info is unavailable, but support data is shown below.</p>
		</div>
	{/if}

	<div class="grid md:grid-cols-2 grid-cols-1 gap-6">
		<div class="flex flex-col w-full gap-6">
			{#if config && request}
				<div class="glass-card card-hover rounded-2xl p-4 flex flex-col gap-4">
					<header class="card-header text-primary-500 h3 font-bold">Firmware</header>
					<section class="text-lg">
						<div class="flex flex-col">
							<div class="flex justify-between">
								<div>
									<span class="text-neutral-400 mr-1 text-base">{config.manufacturer}/</span
									>{config.target}
								</div>
								<div class="flex gap-2">
									<a
										href={`${base}/targets/${config.target}`}
										class="btn preset-filled-primary-500 btn-sm"
										data-sveltekit-preload-data="hover"
										data-sveltekit-preload-code="eager"
									>
										<span><Icon src={FileScan} size="1rem" /></span>
										<span>View Target</span>
									</a>
									<a
										href={`https://github.com/betaflight/config/blob/master/configs/${config.target}/config.h`}
										class="btn preset-filled-primary-500 btn-sm"
									>
										<span><Icon src={Github} size="1rem" /></span>
										<span>Open Target</span>
									</a>
								</div>
							</div>
							<hr class="hr border-surface-500 my-4 border-t-2" />
							<div class="flex justify-between items-center">
								<div>
									<div class="flex flex-row">
										<span class="text-neutral-400 mr-1 text-base">Release:</span>
										<span class="text-base">{request.release}</span>
									</div>
									<div class="flex flex-row">
										<span class="text-neutral-400 mr-1 text-base">Tag:</span>
										<span class="text-base">{request.tag}</span>
									</div>
								</div>
								<a
									href="https://github.com/betaflight/betaflight/releases/tag/{request.release}"
									target="_blank"
									class="btn preset-filled-secondary-500 btn-sm"
								>
									<span><Icon src={BookOpen} size="1rem" /></span>
									<span>Changelog</span>
								</a>
							</div>
						</div>
					</section>
				</div>
			{/if}

			{#if build}
				<div class="glass-card card-hover rounded-2xl p-4 flex flex-col gap-4">
					<header class="card-header text-primary-500 h3 font-bold">Build</header>
					<section class="text-lg">
						<div class="flex flex-row items-center w-full justify-between">
							<div class="flex">
								<span class="text-neutral-400 mr-1 text-base">Status:</span>
								<span class="badge preset-filled-success-500">{build.status}</span>
							</div>
							<div class="flex gap-2 flex-wrap w-min">
								<a
									href="https://build.betaflight.com/api/builds/{build.identifier}/log"
									target="_blank"
									class="btn preset-filled-secondary-500 btn-sm"
								>
									<span><Icon src={BookOpen} size="1rem" /></span>
									<span>View Log</span>
								</a>
								<a
									href="https://build.betaflight.com/api/builds/{build.identifier}/hex"
									target="_blank"
									class="btn preset-filled-primary-500 btn-sm"
								>
									<span><Icon src={Download} size="1rem" /></span>
									<span>Download .hex</span>
								</a>
							</div>
						</div>
						<hr class="hr border-surface-500 my-4 border-t-2" />
						<div class="flex flex-col">
							<div class="flex flex-row">
								<span class="text-neutral-400 mr-1 text-base">Submitted:</span>
								<span class="text-base">{formatTime(build.submitted)}</span>
							</div>
							<div class="flex flex-row">
								<span class="text-neutral-400 mr-1 text-base">Elapsed:</span>
								<span class="text-base">{build.elapsed}</span>
								<span class="text-neutral-400 mr-1 text-base">ms</span>
							</div>
						</div>
					</section>
				</div>
			{/if}

			{#if problem}
				<div class="glass-card card-hover rounded-2xl p-4 flex flex-col gap-4">
					<header class="card-header text-primary-500 h3 font-bold">Problem Description</header>
					<section class="text-lg">
						<blockquote class="blockquote text-base">{problem}</blockquote>
					</section>
				</div>
			{/if}

			{#if ArmingDisableFlags.length > 0}
				<div class="glass-card card-hover rounded-2xl p-4 flex flex-col gap-4">
					<header class="card-header text-primary-500 h3 font-bold">Arming Disable Flags</header>
					<section class="text-lg">
						<div class="flex flex-row flex-wrap gap-2">
							{#each ArmingDisableFlags as flag, i (i)}
								<div class="badge preset-tonal-error border border-error-500">{flag}</div>
							{/each}
						</div>
					</section>
				</div>
			{/if}

			{#if dma && Object.keys(dma).length > 0}
				<div class="glass-card card-hover rounded-2xl p-4 flex flex-col gap-4">
					<header class="card-header text-primary-500 h3 font-bold">DMA</header>
					<section class="text-lg">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#each Object.keys(dma) as dmaKey, i (i)}
								<div class="flex flex-col gap-2">
									<div class="text-primary-500 font-bold">{dmaKey}:</div>
									{#each Object.keys(dma[dmaKey]) as channelKey, j (j)}
										<div class="flex flex-row">
											<span class="text-neutral-400 mr-1 text-base">{dmaKey} {channelKey}:</span>
											{#if dma[dmaKey][channelKey] === "FREE"}
												<span class="badge preset-tonal-tertiary border border-tertiary-500"
													>{dma[dmaKey][channelKey]}</span
												>
											{:else}
												<span class="badge preset-tonal-success border border-success-500"
													>{dma[dmaKey][channelKey]}</span
												>
											{/if}
										</div>
									{/each}
								</div>
							{/each}
						</div>
					</section>
				</div>
			{/if}
		</div>

		<div class="flex flex-col w-full gap-6">
			{#if request}
				<div class="glass-card card-hover rounded-2xl p-4 flex flex-col gap-4">
					<header class="card-header text-primary-500 h3 font-bold">Options</header>
					<section class="text-lg">
						<div class="flex gap-2 flex-row flex-wrap">
							{#each request.options as option, i (i)}
								<div class="badge preset-tonal-primary">{option}</div>
							{/each}
						</div>
					</section>
				</div>
			{/if}

			{#if status}
				<div class="glass-card card-hover rounded-2xl p-4 flex flex-col gap-4">
					<header class="card-header text-primary-500 h3 font-bold">Hardware</header>
					<section class="text-lg">
						{#if config}
							<div class="flex flex-row">
								<span class="text-neutral-400 mr-1 text-base">MCU:</span>
								<span class="text-base">{config.mcu}</span>
							</div>
						{/if}
						<div class="flex flex-col md:flex-row">
							<div class="flex flex-row">
								<span class="text-neutral-400 mr-1 text-base">Gyro:</span>
								<span class="text-base">{status.GYRO}</span>
							</div>
							<span class="hidden md:block divider-vertical ml-4 mr-4"></span>
							<div class="flex flex-row">
								<span class="text-neutral-400 mr-1 text-base">Accelerometer:</span>
								<span class="text-base">{status.ACC}</span>
							</div>
						</div>
						<div class="flex flex-row">
							<span class="text-neutral-400 mr-1 text-base">Barometer:</span>
							<span class="text-base">{status.BARO}</span>
						</div>
						<div class="flex flex-row">
							<span class="text-neutral-400 mr-1 text-base">OSD:</span>
							<span class="text-base">{status.OSD}</span>
						</div>
					</section>
				</div>
				<div class="glass-card card-hover rounded-2xl p-4 flex flex-col gap-4">
					<header class="card-header text-primary-500 h3 font-bold">Status</header>
					<section class="text-lg">
						<div class="flex flex-row">
							<span class="text-neutral-400 mr-1 text-base">CPU Load:</span>
							<span class="text-base">{status.CPU}</span>
						</div>
						<div class="flex flex-row">
							<span class="text-neutral-400 mr-1 text-base">Core Tempreature:</span>
							<span class="text-base">{status["Core temp"]}</span>
						</div>
						<div class="flex flex-row">
							<div class="flex flex-row">
								<span class="text-neutral-400 mr-1 text-base">Cycle Time:</span>
								<span class="text-base">{status["cycle time"]}</span>
							</div>
							<span class="divider-vertical ml-4 mr-4"></span>
							<div class="flex flex-row">
								<span class="text-neutral-400 mr-1 text-base">System Rate:</span>
								<span class="text-base">{status["System rate"]}</span>
							</div>
						</div>
						<div class="flex flex-row">
							<div class="flex flex-row">
								<span class="text-neutral-400 mr-1 text-base">Gyro Rate:</span>
								<span class="text-base">{status["GYRO rate"]}Hz</span>
							</div>
							<span class="divider-vertical ml-4 mr-4"></span>
							{#if pidRate !== null}
								<div class="flex flex-row">
									<span class="text-neutral-400 mr-1 text-base">PID Rate:</span>
									<span class="text-base">{pidRate}Hz</span>
								</div>
							{/if}
							<span class="divider-vertical ml-4 mr-4"></span>
							<div class="flex flex-row">
								<span class="text-neutral-400 mr-1 text-base">RX Rate:</span>
								<span class="text-base">{status["RX rate"]}</span>
							</div>
						</div>
						<div class="flex flex-row">
							<span class="text-neutral-400 mr-1 text-base">MCU Clock:</span>
							{#each Object.keys(status).filter((key) => key.includes("Clock")) as key, i (i)}
								<span class="text-base">{status[key]}</span>
							{/each}
						</div>
					</section>
				</div>
			{/if}

			{#if timer}
				<div class="glass-card card-hover rounded-2xl p-4 flex flex-col gap-4">
					<header class="card-header text-primary-500 h3 font-bold">Timers</header>
					<section class="text-lg">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#each splitTimer as timerHalf, i (i)}
								<div class="flex flex-col w-full">
									{#each timerHalf as timerKey, j (j)}
										<div class="flex flex-col">
											<header class="font-medium flex items-center">
												<span>{timerKey}:</span>
												{#if typeof timer[timerKey] === "string" && timer[timerKey] === "FREE"}
													<span
														class="badge preset-tonal-tertiary border border-tertiary-500 ml-2"
														>{timer[timerKey]}</span
													>
												{/if}
											</header>
											{#if typeof timer[timerKey] !== "string"}
												{#each Object.keys(timer[timerKey]) as channelKey, k (k)}
													<div class="flex flex-row">
														<span class="text-neutral-400 mr-1 text-base pl-3">{channelKey}:</span>
														<span class="badge preset-tonal-success border border-success-500"
															>{timer[timerKey][channelKey]}</span
														>
													</div>
												{/each}
											{/if}
										</div>
									{/each}
								</div>
							{/each}
						</div>
					</section>
				</div>
			{/if}
		</div>
	</div>

	{#if serial}
		<Ports {serial} />
	{/if}

	{#if modes}
		<Modes {modes} />
	{/if}

	{#if commonSettings}
		<Accordion collapsible>
			<Accordion.Item
				classes="glass-card card-hover rounded-2xl"
				controlHover="hover:bg-primary-500/10"
				value="commonSettings"
			>
				{#snippet control()}
					<header class="h2 font-bold mb-4 mt-3">Common Settings</header>
				{/snippet}

				{#snippet panel()}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
						{#each Object.keys(commonSettings) as section, i (i)}
							<div class="flex flex-col gap-2">
								<header class="text-primary-500 h5 font-semibold font-mono">{section}</header>
								{#each Object.keys(commonSettings[section]) as setting, j (j)}
									<div class="flex flex-row">
										<span class="mr-1 text-base">{commonSettings[section][setting].name}:</span>
										<span class="badge preset-tonal-primary"
											>{commonSettings[section][setting].value}</span
										>
									</div>
								{/each}
							</div>
						{/each}
					</div>
				{/snippet}
			</Accordion.Item>
		</Accordion>
	{/if}

	{#if dump}
		<Accordion collapsible>
			<Accordion.Item
				classes="glass-card card-hover rounded-2xl"
				controlHover="hover:bg-primary-500/10"
				value="dump"
			>
				{#snippet control()}
					<header class="h2 font-bold mb-4 mt-3 text-primary-500">Dump</header>
				{/snippet}

				{#snippet panel()}
					<CodeBlock
						classes="card max-h-[88vh] overflow-scroll"
						lang="nim"
						code={dump}
						preClasses="[&>pre]:!bg-transparent"
					/>
				{/snippet}
			</Accordion.Item>
		</Accordion>
	{/if}
</div>