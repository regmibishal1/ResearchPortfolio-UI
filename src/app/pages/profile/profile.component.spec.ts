import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { signal } from '@angular/core'
import { of, throwError } from 'rxjs'

import { ProfileComponent } from './profile.component'
import { UserService } from '../../services/user.service'
import { AuthService } from '../auth/auth.service'

describe('ProfileComponent', () => {
  const profile = {
    id: 1,
    firstname: 'Ada',
    lastname: 'Lovelace',
    email: 'ada@example.test',
    username: 'ada',
    role: 'USER',
  }

  it('says when the profile could not be loaded and loads it again on request', () => {
    const getProfile = jasmine.createSpy('getProfile').and.returnValues(
      throwError(() => new Error('offline')),
      of(profile)
    )
    TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: { getProfile } },
        { provide: AuthService, useValue: { role: signal(null) } },
      ],
    })
    const fixture = TestBed.createComponent(ProfileComponent)
    fixture.detectChanges()
    const el: HTMLElement = fixture.nativeElement

    const alert = el.querySelector('[role="alert"]')!
    expect(alert.textContent).toContain('Could not load your profile')

    alert.querySelector('button')!.click()
    fixture.detectChanges()
    expect(getProfile).toHaveBeenCalledTimes(2)
    expect(el.querySelector('[role="alert"]')).toBeNull()
    expect(el.textContent).toContain('Ada Lovelace')
  })
})
