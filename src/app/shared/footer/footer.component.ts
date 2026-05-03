import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatIconModule],
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
