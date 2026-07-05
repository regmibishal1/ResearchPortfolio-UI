import { TestBed, fakeAsync, tick } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { of } from 'rxjs'
import { delay } from 'rxjs/operators'
import { Chart } from 'chart.js'

import { StocksComponent } from './stocks.component'
import {
  CompaniesResponse,
  LatestResponse,
  RunMeta,
  StocksService,
  TrackRecordResponse,
} from '../../services/stocks.service'

const run: RunMeta = {
  id: 1,
  as_of_date: '2026-07-05',
  label: null,
  universe_size: 154,
  n_events: 7421,
  start_date: '2009-04-15',
  end_date: '2026-07-01',
  run_timestamp_utc: '2026-07-05T12:00:00Z',
  metrics: { ic_mean: 0.038, ic_t: 2.74, ls_mean_qtr: 0.89, ls_sharpe: 0.5 },
}

const latest: LatestResponse = {
  run,
  sectors: [
    {
      sector: 'XLK',
      sector_name: 'Information Technology',
      n_names: 16,
      mean_sue: 0.5,
      mean_predicted_vol: 0.2,
      mean_exret_63: 0.01,
    },
  ],
}

const companies: CompaniesResponse = { run, companies: [] }

const track: TrackRecordResponse = {
  run,
  points: [
    { period_label: '2024', ic: 0.04, long_short_ret: 0.008, n: 4 },
    { period_label: '2025', ic: 0.02, long_short_ret: 0.007, n: 4 },
  ],
}

// Reassigned per test (and reset in beforeEach) so specs stay independent
// regardless of execution order.
let trackResponse: TrackRecordResponse

// delay(0) delivers each response on a macrotask, like real HTTP. The
// component must therefore draw the chart when the canvas appears in the
// DOM, not when the subscribe callback runs; drawing any earlier is the
// blank-panel regression this spec pins down.
const stocksStub: Partial<StocksService> = {
  getLatest: () => of(latest).pipe(delay(0)),
  getCompanies: () => of(companies).pipe(delay(0)),
  getTrackRecord: () => of(trackResponse).pipe(delay(0)),
}

describe('StocksComponent', () => {
  beforeEach(async () => {
    trackResponse = track
    await TestBed.configureTestingModule({
      imports: [StocksComponent],
      providers: [provideRouter([]), { provide: StocksService, useValue: stocksStub }],
    }).compileComponents()
  })

  it('renders the track-record chart once async data lands', fakeAsync(() => {
    const fixture = TestBed.createComponent(StocksComponent)
    fixture.detectChanges() // ngOnInit subscribes; view still shows loading
    tick() // responses arrive on their macrotasks
    fixture.detectChanges() // loading gate flips; canvas enters the DOM

    const canvas: HTMLCanvasElement | null = fixture.nativeElement.querySelector(
      '.chart-wrap canvas'
    )
    expect(canvas).withContext('track-record canvas should render').toBeTruthy()
    expect(Chart.getChart(canvas as HTMLCanvasElement))
      .withContext('a Chart instance should be attached to the canvas')
      .toBeTruthy()

    fixture.destroy() // release the Chart instance between specs
  }))

  it('hides the track-record panel when no points exist', fakeAsync(() => {
    trackResponse = { run, points: [] }

    const fixture = TestBed.createComponent(StocksComponent)
    fixture.detectChanges()
    tick()
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('.chart-wrap'))
      .withContext('empty track record should collapse the panel entirely')
      .toBeNull()

    fixture.destroy()
  }))
})
