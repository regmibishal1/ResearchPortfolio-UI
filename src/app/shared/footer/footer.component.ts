import { Component, ChangeDetectionStrategy } from '@angular/core'
import { DatePipe } from '@angular/common'
import { IconComponent } from '../icon/icon.component'

// Set by scripts/build-app.mjs on production builds; absent in dev and tests.
declare const BUILD_DATE: string | undefined

@Component({
  selector: 'app-footer',
  imports: [DatePipe, IconComponent],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  currentYear = new Date().getFullYear()
  buildDate: string | null = typeof BUILD_DATE === 'undefined' ? null : BUILD_DATE

  socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/regmibishal1/',
      icon: 'github' as const,
      external: true,
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/bishalregmi/',
      icon: 'linkedin' as const,
      external: true,
    },
    {
      name: 'Email',
      url: 'mailto:contact@bishalregmi.com',
      icon: 'email' as const,
      external: false,
    },
    {
      name: 'RSS',
      url: '/feed.xml',
      icon: 'rss_feed' as const,
      external: false,
    },
  ]
}
