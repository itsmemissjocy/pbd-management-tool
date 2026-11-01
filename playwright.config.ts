import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'tests/e2e',workers:1,use:{baseURL:'http://localhost:3000',headless:true,launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium'}},webServer:{command:'APP_MODE=demo npm run dev',url:'http://localhost:3000',reuseExistingServer:true,timeout:120000}});
