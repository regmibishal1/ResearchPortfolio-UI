import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { RouterModule } from '@angular/router'
import { Project } from '../../data/projects'
import { StatusBadgeComponent } from '../status-badge/status-badge.component'

/**
 * A project card for Home and the Featured list: screenshot, status, title
 * and one line on the result. The title is the card's only link and its
 * click area covers the whole card.
 */
import { projectSrcset } from '../project-srcset'

@Component({
  selector: 'app-work-card',
  imports: [RouterModule, StatusBadgeComponent],
  templateUrl: './work-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './work-card.component.scss',
})
export class WorkCardComponent {
  readonly project = input.required<Project>()
  readonly srcset = projectSrcset
}
