import { TestBed } from '@angular/core/testing'
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router'
import { provideHttpClientTesting } from '@angular/common/http/testing'

import { ProjectDetailComponent } from './project-detail.component'
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http'

function render(id: string) {
  TestBed.configureTestingModule({
    imports: [ProjectDetailComponent],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id }) } } },
      provideHttpClient(withXhr(), withInterceptorsFromDi()),
      provideHttpClientTesting(),
    ],
  })
  const fixture = TestBed.createComponent(ProjectDetailComponent)
  fixture.detectChanges()
  return fixture.nativeElement as HTMLElement
}

describe('ProjectDetailComponent', () => {
  it('renders a known project', () => {
    const el = render('showupmd')
    expect(el.querySelector('.detail-page')).not.toBeNull()
    expect(el.querySelector('app-page-not-found')).toBeNull()
  })

  it('shows the not-found page for an unknown project instead of redirecting', () => {
    const el = render('no-such-project')
    expect(el.querySelector('.detail-page')).toBeNull()
    expect(el.querySelector('app-page-not-found')).not.toBeNull()
  })
})
