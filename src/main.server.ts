import { bootstrapApplication } from '@angular/platform-browser'
import { AppComponent } from './app/app.component'
import { config } from './app/app.config.server'

// Entry point for build-time prerendering only; the site is still served as
// static files, there is no server at runtime.
const bootstrap = () => bootstrapApplication(AppComponent, config)

export default bootstrap
