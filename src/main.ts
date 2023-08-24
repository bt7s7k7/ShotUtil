import { createApp } from "vue"
import { App } from "./app/App"
import { DARK_THEME } from "./vue3gui/theme/dark"
import "./vue3gui/theme/dark.scss"
import { vue3gui } from "./vue3gui/vue3gui"

const app = createApp(App)

app.use(vue3gui, {
    theme: DARK_THEME
})

app.mount("#app")

