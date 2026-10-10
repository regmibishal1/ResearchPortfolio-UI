import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Project, statusText } from '../../data/projects'

/** A project's status as a small pill with a dot, e.g. "Live" or "Final results". */
@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  @Input({ required: true }) project!: Project

  get label(): string | null {
    return statusText(this.project)
  }
}
