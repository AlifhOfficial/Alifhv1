import { proxy } from "./src/proxy";

export const middleware = proxy;

// Must be a statically analyzable object for Next.js
export const config = {
	matcher: [
		"/user-dashboard/:path*",
		"/admin-dashboard/:path*",
		"/partner-dashboard/:path*",
		"/staff-dashboard/:path*",
	],
};
