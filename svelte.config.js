import adapterAuto from "@sveltejs/adapter-auto"
import adapterCloudflare from "@sveltejs/adapter-cloudflare"
import adapterNode from "@sveltejs/adapter-node"
import adapterStatic from "@sveltejs/adapter-static"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"

// Select adapter based on ADAPTER env var:
// - "node" → Docker/local Node
// - "cloudflare" → Cloudflare Pages/Workers
// - "static" → GitHub Pages / static hosting
// - default → adapter-auto (Netlify, Vercel, etc.)
function getAdapter() {
	switch (process.env.ADAPTER) {
		case "node":
			return adapterNode()
		case "cloudflare":
			return adapterCloudflare()
		case "static":
			return adapterStatic({
				pages: "build",
				assets: "build",
				fallback: "404.html",
				precompress: false
			})
		default:
			return adapterAuto()
	}
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: [".svelte"],
	preprocess: [vitePreprocess()],

	vitePlugin: {
		inspector: false
	},
	kit: {
		adapter: getAdapter(),
		paths: {
			base: process.env.ADAPTER === "static" ? "/betaflight-support-explorer" : ""
		},
		alias: {
			$components: "./src/components"
		}
	}
}
export default config