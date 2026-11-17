import {defineConfig} from "vitest/config";
import path from "node:path";
export default defineConfig({resolve:{alias:{"@":path.resolve(__dirname,"src"),"server-only":path.resolve(__dirname,"tests/shims/server-only.ts")}},test:{include:["tests/unit/**/*.test.ts","tests/integration/**/*.test.ts"],environment:"node",testTimeout:30000,hookTimeout:30000,reporters:["default","json"],outputFile:{json:"test-results/vitest.json"},sequence:{concurrent:false}}});
