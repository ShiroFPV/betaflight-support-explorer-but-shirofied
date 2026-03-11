import posthog from "posthog-js"
import { browser } from "$app/environment"

// Disable prerendering and SSR: the app fetches data client-side at runtime
// (support IDs are dynamic) and must work as a static SPA for GitHub Pages.
export const prerender = false
export const ssr = false

export const load = async () => {
	if (browser) {
		posthog.init("phc_5lkemDqQpGZFBXuwM0LkZF8zIEKiphDQbnxA95VWtrC", {
			api_host: "https://us.i.posthog.com",
			defaults: "2025-05-24",
			person_profiles: "identified_only" // or 'always' to create profiles for anonymous users as well
		})
	}

	return
}
