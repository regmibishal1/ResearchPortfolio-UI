import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'

import { DashboardComponent } from './dashboard.component'

describe('DashboardComponent', () => {
  let component: DashboardComponent
  let fixture: ComponentFixture<DashboardComponent>
  let httpMock: HttpTestingController

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
      ],
    }).compileComponents()

    httpMock = TestBed.inject(HttpTestingController)
    fixture = TestBed.createComponent(DashboardComponent)
    component = fixture.componentInstance
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should create', fakeAsync(() => {
    fixture.detectChanges() // triggers ngAfterViewInit; sample() is deferred
    tick() // flush setTimeout → sample() runs → loading=true → HTTP fires
    httpMock
      .expectOne((req) => req.url.includes('/stats/sample'))
      .flush({
        histogram: [],
        stats: { mean: 0, std: 1 },
        distribution: 'normal',
        params: { mean: 0, std: 1 },
        n_samples: 2000,
      })
    fixture.detectChanges() // pick up result + loading=false
    expect(component).toBeTruthy()
  }))
})
