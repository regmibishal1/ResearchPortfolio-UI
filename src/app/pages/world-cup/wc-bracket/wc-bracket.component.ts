import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import { BracketResponse, MatchDetail } from '../../../services/world-cup.service'

export type BracketRound = 'r32' | 'r16' | 'qf' | 'sf' | 'final'

/** One match in the bracket, with the team that went (or was picked to go) through. */
export interface BracketSlot {
  key: string
  round: string
  teams: string[]
  detail: MatchDetail | null
  winner: string | null
}

interface BracketColumn {
  label: string
  slots: BracketSlot[]
}

export const BRACKET_ROUNDS: { key: BracketRound; short: string; label: string }[] = [
  { key: 'r32', short: 'R32', label: 'Round of 32' },
  { key: 'r16', short: 'R16', label: 'Round of 16' },
  { key: 'qf', short: 'QF', label: 'Quarter-finals' },
  { key: 'sf', short: 'SF', label: 'Semi-finals' },
  { key: 'final', short: 'Final', label: 'Final' },
]

/**
 * The knockout bracket. Wide screens show both halves meeting at the
 * final; narrower ones show one round at a time, picked from a row of
 * buttons, starting at the final.
 */
@Component({
  selector: 'app-wc-bracket',
  imports: [NgTemplateOutlet],
  templateUrl: './wc-bracket.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './wc-bracket.component.scss',
})
export class WcBracketComponent implements OnChanges {
  @Input({ required: true }) bracket!: BracketResponse
  /** The model's favorite before kickoff, shown under the champion once the final is played. */
  @Input() favorite: { team: string; pct: number } | null = null
  @Input() round: BracketRound = 'final'
  @Output() roundChange = new EventEmitter<BracketRound>()

  readonly rounds = BRACKET_ROUNDS

  left: BracketColumn[] = []
  right: BracketColumn[] = []
  final: BracketSlot | null = null
  bronze: BracketSlot | null = null
  byRound: Record<BracketRound, BracketSlot[]> = { r32: [], r16: [], qf: [], sf: [], final: [] }
  groupKeys: string[] = []

  private openFactors = new Set<string>()

  ngOnChanges(): void {
    this.build(this.bracket)
  }

  get roundLabel(): string {
    return this.rounds.find((r) => r.key === this.round)?.label ?? ''
  }

  selectRound(round: BracketRound): void {
    this.round = round
    this.roundChange.emit(round)
  }

  /** Screen reader text for the team marked as going through. */
  winnerNote(slot: BracketSlot): string {
    const played = !!slot.detail?.played
    if (slot.round === 'Final') return played ? 'champion' : 'predicted champion'
    if (slot.round === 'Bronze') return played ? 'third place' : 'predicted third place'
    return played ? 'advanced' : 'predicted to advance'
  }

  isFactorOpen(slot: BracketSlot): boolean {
    return this.openFactors.has(slot.key)
  }

  toggleFactors(slot: BracketSlot): void {
    if (this.openFactors.has(slot.key)) this.openFactors.delete(slot.key)
    else this.openFactors.add(slot.key)
  }

  formatFactorValue(feature: string, value: number): string {
    if (feature === 'is_neutral') return value >= 0.5 ? 'neutral site' : 'host advantage'
    const sign = value > 0 ? '+' : ''
    if (feature === 'form_diff') return `${sign}${(value * 100).toFixed(0)}%`
    if (feature === 'goals_form_diff') return `${sign}${value.toFixed(2)}`
    if (Math.abs(value) >= 10) return `${sign}${value.toFixed(0)}`
    return `${sign}${value.toFixed(1)}`
  }

  private build(b: BracketResponse): void {
    const md = b.match_details ?? {}
    // A team "goes through" if it appears in the next round's pairs.
    const next = (pairs: string[][]) => new Set(pairs.flat())
    const slots = (
      round: string,
      pairs: string[][],
      details: MatchDetail[],
      through: Set<string>,
      offset = 0
    ): BracketSlot[] =>
      pairs.map((teams, i) => {
        const detail = details[i] ?? null
        const winner = detail?.played
          ? detail.winner ?? null
          : teams.find((t) => through.has(t)) ?? null
        return { key: `${round}-${i + offset}`, round, teams, detail, winner }
      })

    const r32 = slots('R32', b.r32, md['R32'] ?? [], next(b.r16))
    const r16 = slots('R16', b.r16, md['R16'] ?? [], next(b.qf))
    const qf = slots('QF', b.qf, md['QF'] ?? [], next(b.sf))
    const sf = slots('SF', b.sf, md['SF'] ?? [], new Set(b.final_pair))
    this.final = slots('Final', [b.final_pair], md['Final'] ?? [], new Set([b.champion]))[0]
    const bronzeDetail = md['Bronze']?.[0] ?? null
    this.bronze = bronzeDetail
      ? {
          key: 'Bronze-0',
          round: 'Bronze',
          teams: bronzeDetail.teams,
          detail: bronzeDetail,
          winner: bronzeDetail.played ? bronzeDetail.winner : bronzeDetail.predicted_winner ?? null,
        }
      : null

    // The bracket's first half feeds the first semi-final, the second half the other.
    const half = (list: BracketSlot[], first: boolean) =>
      first ? list.slice(0, list.length / 2) : list.slice(list.length / 2)
    this.left = [
      { label: 'Round of 32', slots: half(r32, true) },
      { label: 'Round of 16', slots: half(r16, true) },
      { label: 'Quarter-final', slots: half(qf, true) },
      { label: 'Semi-final', slots: half(sf, true) },
    ]
    this.right = [
      { label: 'Semi-final', slots: half(sf, false) },
      { label: 'Quarter-final', slots: half(qf, false) },
      { label: 'Round of 16', slots: half(r16, false) },
      { label: 'Round of 32', slots: half(r32, false) },
    ]
    this.byRound = { r32, r16, qf, sf, final: [this.final] }
    this.groupKeys = Object.keys(b.group_winners).sort()
  }
}
