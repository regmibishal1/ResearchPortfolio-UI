/**
 * Compile-time contract between the UI's interfaces and the FastAPI
 * responses. fastapi-schema.ts is generated from the API's committed
 * OpenAPI schema (fastapi-openapi.json, copied from the API repo) by
 * `yarn api:types`.
 * Each line below says "everything the API sends fits what the UI expects":
 * a field the UI reads but the API does not send, or sends as another type,
 * fails the test build here instead of breaking a page.
 *
 * Fields with defaults count as always sent (see Sent below). The report
 * card, scenarios and retrospective arrive as free-form JSON
 * blobs (typed as records in the API), so only their envelopes are checked.
 */
import type { components } from './fastapi-schema'
import type * as WorldCup from '../services/world-cup.service'
import type * as Stocks from '../services/stocks.service'

type Schemas = components['schemas']
/**
 * What the API actually sends. FastAPI serializes every field of a response
 * model, defaults included, so a field the schema marks optional (it has a
 * default) is always present in the JSON, possibly as null.
 */
type Sent<T> = T extends (infer U)[]
  ? Sent<U>[]
  : T extends object
    ? { [K in keyof T]-?: Sent<Exclude<T[K], undefined>> }
    : T
/** True when every response the API can send is also a valid Ui value. */
type Fits<Api, Ui> = [Sent<Api>] extends [Ui] ? true : false

// World Cup
const wcRun: Fits<Schemas['src__endpoints__worldcup__RunMeta'], WorldCup.RunMeta> = true
const wcTeam: Fits<Schemas['TeamRow'], WorldCup.TeamRow> = true
const wcLatest: Fits<Schemas['src__endpoints__worldcup__LatestResponse'], WorldCup.LatestResponse> =
  true
const wcFactor: Fits<Schemas['TopFactor-Output'], WorldCup.TopFactor> = true
const wcMatch: Fits<Schemas['MatchDetail-Output'], WorldCup.MatchDetail> = true
const wcBracket: Fits<Schemas['BracketResponse'], WorldCup.BracketResponse> = true
const wcPoint: Fits<Schemas['HistoryPoint'], WorldCup.HistoryPoint> = true
const wcSeries: Fits<Schemas['TeamSeries'], WorldCup.TeamSeries> = true
const wcHistory: Fits<
  Schemas['src__endpoints__worldcup__HistoryResponse'],
  WorldCup.HistoryResponse
> = true
const wcPlayed: Fits<Schemas['PlayedMatch'], WorldCup.PlayedMatch> = true
const wcPlayedList: Fits<Schemas['PlayedMatchesResponse'], WorldCup.PlayedMatchesResponse> = true
type Envelope<T> = Omit<T, 'report_card' | 'scenarios' | 'retrospective'>
const wcReport: Fits<
  Envelope<Schemas['ReportCardResponse']>,
  Envelope<WorldCup.ReportCardResponse>
> = true
const wcScenarios: Fits<
  Envelope<Schemas['ScenariosResponse']>,
  Envelope<WorldCup.ScenariosResponse>
> = true
const wcRetro: Fits<
  Envelope<Schemas['RetrospectiveResponse']>,
  Envelope<WorldCup.RetrospectiveResponse>
> = true

// Stocks
const stRun: Fits<Schemas['src__endpoints__stocks__RunMeta'], Stocks.RunMeta> = true
const stSector: Fits<Schemas['SectorRow'], Stocks.SectorRow> = true
const stLatest: Fits<Schemas['src__endpoints__stocks__LatestResponse'], Stocks.LatestResponse> =
  true
const stCompany: Fits<Schemas['CompanyRow'], Stocks.CompanyRow> = true
const stCompanies: Fits<Schemas['CompaniesResponse'], Stocks.CompaniesResponse> = true
const stCompanyPoint: Fits<Schemas['CompanyHistoryPoint'], Stocks.CompanyHistoryPoint> = true
const stCompanyDetail: Fits<Schemas['CompanyDetailResponse'], Stocks.CompanyDetailResponse> = true
const stTrackPoint: Fits<Schemas['TrackRecordPoint'], Stocks.TrackRecordPoint> = true
const stTrack: Fits<Schemas['TrackRecordResponse'], Stocks.TrackRecordResponse> = true
const stMetric: Fits<Schemas['MetricPoint'], Stocks.MetricPoint> = true
const stHistory: Fits<Schemas['src__endpoints__stocks__HistoryResponse'], Stocks.HistoryResponse> =
  true

describe('API contract', () => {
  it('compiles only while the UI interfaces fit the API responses', () => {
    const checks = [
      wcRun,
      wcTeam,
      wcLatest,
      wcFactor,
      wcMatch,
      wcBracket,
      wcPoint,
      wcSeries,
      wcHistory,
      wcPlayed,
      wcPlayedList,
      wcReport,
      wcScenarios,
      wcRetro,
      stRun,
      stSector,
      stLatest,
      stCompany,
      stCompanies,
      stCompanyPoint,
      stCompanyDetail,
      stTrackPoint,
      stTrack,
      stMetric,
      stHistory,
    ]
    expect(checks.every(Boolean)).toBeTrue()
  })
})
