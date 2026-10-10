import { Component } from '@angular/core'

import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-footer',
  imports: [MatIconModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  currentYear = new Date().getFullYear()

  socialLinks = [
    { name: 'GitHub', url: 'https://github.com/regmibishal1/', icon: 'code' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/bishalregmi/', icon: 'work' },
    { name: 'Email', url: 'mailto:contact@bishalregmi.com', icon: 'email' },
  ]
}
