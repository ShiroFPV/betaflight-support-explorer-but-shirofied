<script lang="ts">
	import { base } from "$app/paths"
</script>

<footer
	class="mt-16 relative"
	style="border-top: 1px solid; border-image: linear-gradient(90deg, transparent, #ffb4e0, #9ee8ff, #ffd0ea, transparent) 1;"
>
	<div
		class="px-8 py-10 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-surface-300"
	>
		<!-- Branding -->
		<div class="flex flex-col items-center sm:items-start gap-1">
			<a
				href="https://shirofpv.dev"
				class="gradient-text font-bold text-base"
				target="_blank"
				rel="noopener noreferrer"
			>
				ShiroFPV
			</a>
			<span class="text-surface-400 text-xs">
				Betaflight Support Explorer
			</span>
			<span class="text-surface-500 text-xs mt-1">
				&copy; {new Date().getFullYear()} ShiroFPV. All rights reserved.
			</span>
		</div>

		<!-- Links -->
		<div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
			<a
				href="https://shirofpv.dev"
				class="hover:text-primary-400 transition-colors duration-200"
				target="_blank"
				rel="noopener noreferrer"
			>
				shirofpv.dev
			</a>
			<a
				href="https://github.com/ShiroFPV/betaflight-support-explorer-but-shirofied"
				class="hover:text-primary-400 transition-colors duration-200"
				target="_blank"
				rel="noopener noreferrer"
			>
				GitHub Source
			</a>
			<a
				href="{base}/"
				class="hover:text-primary-400 transition-colors duration-200"
			>
				Home
			</a>
			<a
				href="{base}/targets"
				class="hover:text-primary-400 transition-colors duration-200"
			>
				Targets
			</a>
		</div>

		<!-- Netlify compliance -->
		<div class="flex flex-col items-center sm:items-end gap-1">
			<a
				href="https://www.netlify.com"
				class="hover:opacity-80 transition-opacity duration-200"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Powered by Netlify"
			>
				<img
					src="https://www.netlify.com/v3/img/components/netlify-color-accent.svg"
					alt="Powered by Netlify"
					width="114"
					height="51"
					class="h-8 w-auto"
					loading="lazy"
				/>
			</a>
		</div>
	</div>
</footer>
