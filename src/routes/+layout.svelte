<script lang="ts">
	import "../app.css"
	import Nav from "$components/Nav.svelte"
	import Footer from "$components/Footer.svelte"
	import { Tooltip } from "bits-ui"
	import { onMount } from "svelte"

	interface Props {
		children?: import("svelte").Snippet
	}

	let { children }: Props = $props()

	let showBackToTop = $state(false)

	onMount(() => {
		const handleScroll = () => {
			showBackToTop = window.scrollY > 400
		}
		window.addEventListener("scroll", handleScroll, { passive: true })
		return () => window.removeEventListener("scroll", handleScroll)
	})

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: "smooth" })
	}
</script>

<svelte:head>
	<title>Betaflight Support Explorer | ShiroFPV</title>

	<meta
		name="description"
		content="Explore Betaflight support data with ease. Paste your support ID to analyse firmware configuration, detect issues, and browse targets."
	/>
	<meta property="og:title" content="Betaflight Support Explorer | ShiroFPV" />
	<meta property="og:url" content="https://shirofpv.dev/" />
	<meta property="og:type" content="website" />
	<meta
		property="og:description"
		content="Explore Betaflight support data with ease. Paste your support ID to analyse firmware configuration, detect issues, and browse targets."
	/>
	<meta name="theme-color" content="#b48bff" />
</svelte:head>

<!-- Padding top for the fixed navbar -->
<div class="max-w-screen overflow-x-hidden pt-32 lg:pt-16 flex flex-col min-h-screen">
	<Nav />

	<div class="flex-1">
		<Tooltip.Provider delayDuration={300}>{@render children?.()}</Tooltip.Provider>
	</div>

	<Footer />
</div>

<!-- Back to top button -->
{#if showBackToTop}
	<button
		onclick={scrollToTop}
		class="fixed bottom-8 right-8 z-50 glass-card rounded-full px-4 py-3 text-sm font-medium text-primary-400 hover:text-white transition-all duration-300 flex items-center gap-2 card-hover"
		aria-label="Back to top"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="m18 15-6-6-6 6" />
		</svg>
		<span>Top</span>
	</button>
{/if}
