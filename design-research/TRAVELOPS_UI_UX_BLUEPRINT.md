# TravelOps AI Worker — Enterprise UI/UX Blueprint

**Research snapshot:** 2026-07-02  
**Audience:** travel operations agents, reviewers, and operations leads  
**Product posture:** task-centric operational software with bounded AI assistance

## Executive design decision

TravelOps should feel like an operations workbench, not an AI product. The interface must answer five questions in under five seconds:

1. What needs my attention?
2. Why is it in this state?
3. What evidence supports the recommendation?
4. What action can I safely take?
5. What happened after the action?

The coherent reference model is:

- **Linear** for task density, navigation speed, and calm hierarchy.
- **Stripe Dashboard** for resource details, search, monetary clarity, and consequential actions.
- **LangSmith** for focused review queues and trace drill-down.
- **Sentry/Vercel** for chronological execution evidence and error localization.
- **GitHub Primer** for durable component behavior and accessibility.

Retool contributes form efficiency, Datadog contributes filtering patterns, and Dify contributes workflow inspection. Their visual or structural complexity should not define the product.

---

# 1. Benchmark report

## 1.1 Linear

- **Philosophy:** speed through restraint; issues are the primary unit, not dashboards.
- **Information hierarchy:** title and state first, metadata second, activity last.
- **Navigation:** compact left sidebar, shallow hierarchy, command/search access, keyboard navigation.
- **Visual hierarchy:** low-chroma surfaces, one selected row, sparse accent color, strong text hierarchy.
- **Layout:** dense list/detail pattern with contextual panels rather than page proliferation.
- **Typography:** compact sans-serif, small labels, medium-weight titles, controlled line length.
- **Tables/lists:** rows behave like scannable objects; only decision-relevant fields remain visible.
- **Sidebar:** icon + label, grouped by work context, collapsible without becoming icon soup.
- **Detail pattern:** resource header, properties, content, then activity; edits happen in place.
- **Workflow:** status transitions are fast and reversible; shortcuts reward repeat operators.
- **Empty/loading/error:** terse and contextual; the interface avoids decorative empty-state art.
- **Approval/timeline:** not its strongest native pattern; issue activity is useful as a compact audit reference.

Evidence: Linear’s Inbox is explicitly a work-attention surface with quick search, direct issue actions, snooze, and keyboard movement using J/K or arrows ([Linear Inbox](https://linear.app/docs/inbox)).

## 1.2 Stripe Dashboard

- **Philosophy:** make complex financial objects inspectable and safe to operate.
- **Information hierarchy:** amount/status/resource identity first; related objects and metadata below.
- **Navigation:** product/resource sidebar with global cross-resource search.
- **Visual hierarchy:** neutral canvas, clear sections, restrained blue accent, explicit warning/destructive treatment.
- **Layout:** list → resource detail; summary header above structured sections and activity.
- **Typography:** numeric clarity, tabular figures, readable labels, monospace identifiers where useful.
- **Tables:** sortable columns, high-value fields, filters, exports, and preserved searches.
- **Sidebar:** stable product taxonomy; supports breadth without changing the detail grammar.
- **Detail pattern:** object identity, status, primary action, key facts, related records, event history.
- **Workflow:** dangerous financial actions use confirmation, explanation, and state feedback.
- **Empty/loading/error:** action-oriented, with the affected object and remediation path clear.
- **Approval/timeline:** resource events are strong evidence for a business audit timeline.

Evidence: Stripe supports cross-resource search, object IDs, field filters, operators, sorting, dates, amounts, and negation—an excellent model for operator search rather than generic fuzzy search ([Stripe Dashboard search](https://docs.stripe.com/dashboard/search), [Dashboard basics](https://docs.stripe.com/dashboard/basics?locale=en-GB)).

## 1.3 Retool

- **Philosophy:** compose internal operational interfaces from data and actions.
- **Information hierarchy:** data object/table first, selected row detail second, action controls adjacent.
- **Navigation:** application-specific; often sidebar/top tabs generated per internal tool.
- **Visual hierarchy:** functional components, explicit labels, dense data presentation.
- **Layout:** split panes, tables, forms, drawers, and modals; optimized for CRUD and workflow operations.
- **Typography:** utilitarian and compact rather than brand-led.
- **Tables/forms:** strongest benchmark for editable data, bulk actions, validation, conditional fields.
- **Sidebar/detail:** depends on the app builder; useful patterns, inconsistent outcomes.
- **Workflow:** direct data-to-action wiring; good for “inspect → edit → execute.”
- **States:** component-level loading, disabled, validation, query error, and empty states.
- **Approval/timeline:** possible but not a canonical product pattern; usually custom-built.

Evidence: [Retool documentation](https://docs.retool.com/) demonstrates its component/query/workflow model. Its value here is operator efficiency, not its builder UI.

## 1.4 Vercel Dashboard

- **Philosophy:** make deployment state legible, with progressive disclosure into logs and resources.
- **Information hierarchy:** project/environment/status first; deployment identity and diagnostics next.
- **Navigation:** account/team → project → project tabs; scope is always visible.
- **Visual hierarchy:** highly neutral, sharp typography, black primary actions, clear status marks.
- **Layout:** overview cards plus list/detail pages; diagnostics use tabs and searchable log panels.
- **Typography:** compact geometric sans, monospace for identifiers/logs.
- **Tables/lists:** deployments as chronological records with status and source context.
- **Sidebar/detail:** scope-aware navigation; details retain project context.
- **Workflow:** preview → inspect → promote/rollback is a clear consequential-action chain.
- **States:** skeletons and explicit build/runtime error localization.
- **Approval/timeline:** deployment logs and activity logs are strong trace references, not approval references.

Evidence: Vercel separates build, runtime, activity, and audit logs; details expose status, source, resources, warnings, and errors ([Vercel logs](https://vercel.com/docs/logs), [Projects](https://vercel.com/docs/projects), [Activity log](https://vercel.com/docs/activity-log)).

## 1.5 GitHub

- **Philosophy:** stable resource grammar across repositories, issues, pull requests, actions, and settings.
- **Information hierarchy:** resource identity and state, contextual tabs, content, checks/activity.
- **Navigation:** global header plus repository-local navigation and contextual subnavigation.
- **Visual hierarchy:** clear bordered groups, link-blue semantics, status labels, strong focus states.
- **Layout:** responsive fixed-width content with side metadata; complex screens remain predictable.
- **Typography:** system sans; monospace only for code, IDs, and machine output.
- **Tables/lists:** issue/PR rows combine state icon, title, labels, assignee, and metadata.
- **Sidebar/detail:** secondary metadata sits beside the primary conversation/work object.
- **Workflow:** checks and review states remain explicit; destructive actions are isolated.
- **States:** robust blank slates, flash messages, validation errors, skeleton/spinner restraint.
- **Approval/timeline:** pull-request review and Actions logs offer strong decision + evidence patterns.

Evidence: [GitHub Primer](https://primer.style/) provides production component, accessibility, spacing, color, navigation, label, form, and state conventions.

## 1.6 Open WebUI

- **Philosophy:** accessible self-hosted AI interaction centered on conversations and models.
- **Information hierarchy:** conversation and generated content dominate; tools/settings are secondary.
- **Navigation/layout:** conversation sidebar + chat canvas; familiar but wrong for task operations.
- **Typography/visuals:** comfortable reading, chat bubbles/blocks, model controls, rich message content.
- **Tables/forms:** administration exists but is not the main interaction grammar.
- **Detail/workflow:** conversation transcript is the “record”; state machines and business objects are secondary.
- **States:** streaming, model loading, generation error, retry, stop, regenerate.
- **Approval/timeline:** tool call visibility is useful, but chat chronology is not an audit-grade workflow timeline.

Evidence: [Open WebUI documentation](https://docs.openwebui.com/). Its strongest contribution is streaming/tool feedback; its chat-first shell is explicitly rejected.

## 1.7 Dify

- **Philosophy:** enable users to compose and operate AI applications and workflows.
- **Information hierarchy:** app/workflow canvas, node configuration, run state, and logs.
- **Navigation/layout:** product sidebar; canvas + inspector; operational pages for logs/knowledge/settings.
- **Visual hierarchy:** colorful node types and status signals aid authoring but increase visual load.
- **Typography/tables:** modern SaaS defaults; run/log tables expose execution state.
- **Detail/workflow:** node graph is the primary model; inspect a node to see configuration/output.
- **States:** node running/success/error, variable inspection, execution logs.
- **Approval/timeline:** workflow debugging is useful; operator approval is not the core product grammar.

Evidence: [Dify documentation](https://docs.dify.ai/). The node-run inspection pattern is useful only inside Technical Evidence, never as TravelOps’ home screen.

## 1.8 LangSmith

- **Philosophy:** make nondeterministic AI runs inspectable, comparable, and reviewable.
- **Information hierarchy:** project/thread/trace → run tree → inputs, outputs, timing, errors, metadata.
- **Navigation:** observability, evaluation, datasets, and annotation queues as distinct work areas.
- **Visual hierarchy:** dense tables, expandable trees, side panes, metadata blocks, selective color for run type/status.
- **Layout:** list + side detail preserves surrounding context; multiple detail views serve scan vs debug.
- **Typography/tables:** compact technical UI; monospace/raw payloads only where required.
- **Workflow:** filter traces → inspect run → annotate → add to dataset → evaluate.
- **States:** nested run loading/errors, partial spans, trace metadata, review reservation states.
- **Approval/timeline:** annotation queues are the strongest review-queue benchmark; trace trees are the strongest agent-run drill-down benchmark.

Evidence: LangSmith distinguishes Messages, Turns, and Details views, and its annotation queue supports rubrics, reviewer assignment, reservations, notes, and completion states ([Trace views](https://docs.langchain.com/langsmith/view-traces), [Annotation queues](https://docs.langchain.com/langsmith/annotation-queues)).

## 1.9 Sentry

- **Philosophy:** compress noisy events into actionable issues and lead users to root cause.
- **Information hierarchy:** issue title/severity/frequency/affected users first; event evidence and stack details below.
- **Navigation:** issue stream → issue detail → event/span details.
- **Visual hierarchy:** error severity is visible but not allowed to flood the entire page.
- **Layout:** summary and culprit first; tabs/sections progressively reveal evidence.
- **Typography/tables:** compact operational typography, code/stack traces monospace.
- **Workflow:** discover → assign/triage → inspect evidence → resolve/ignore/regress.
- **States:** first seen, ongoing, regressed, resolved, archived; excellent lifecycle semantics.
- **Approval/timeline:** breadcrumbs and event chronology inspire run timelines, not approval cards.

Evidence: [Sentry documentation](https://docs.sentry.io/) and its issue-detail model show how operational symptoms lead into evidence without displaying every technical field at once.

## 1.10 Datadog

- **Philosophy:** explore enormous telemetry spaces through facets, scopes, queries, and linked context.
- **Information hierarchy:** scope/time/query first, visualization/result set second, selected event detail third.
- **Navigation:** broad product taxonomy plus global search and context linking.
- **Visual hierarchy:** dense and technical; color often encodes series, status, or severity.
- **Layout:** query/filter bar, visualization, table, then detail drawer.
- **Typography/tables:** high-density operational data, compact controls, resizable columns.
- **Workflow:** filter → correlate → pivot → inspect → save/share/alert.
- **States:** live/paused data, no matches, delayed ingestion, query errors, partial telemetry.
- **Approval/timeline:** event streams aid trace exploration; not an approval reference.

Evidence: [Datadog documentation](https://docs.datadoghq.com/) demonstrates facet-based exploration and linked telemetry. TravelOps should borrow filter behavior, not observability-product density.

---

# 2. UI elimination report

| Product | Copy | Do not copy | Overdesigned/unnecessary here | Exists because of its business |
|---|---|---|---|---|
| Linear | Dense task rows, keyboard navigation, calm hierarchy, list/detail continuity | Issue-specific vocabulary, extreme shortcut dependence | Command system at full depth | Product/project/roadmap hierarchy |
| Stripe | Resource detail grammar, monetary formatting, searchable identifiers, consequential-action confirmation | Financial product taxonomy | Large analytics/home dashboard | Payments, disputes, balances, payouts |
| Retool | Efficient forms, inline validation, table bulk actions, drawers | Builder canvas, component property editor | Arbitrary drag/drop layout | Low-code app construction |
| Vercel | Status-first details, log progressive disclosure, activity chronology | Black-and-white branding imitation | Deployment/project switching machinery | Git deployment and environment model |
| GitHub | Stable tabs, labels, review semantics, accessibility, focus behavior | Repository metaphors and discussion-heavy layout | Huge universal navigation | Code collaboration ecosystem |
| Open WebUI | Streaming feedback and visible tool activity | Chat sidebar, message bubbles, model picker as primary control | Personas, model playground affordances | Conversational model access |
| Dify | Run/node inspection inside technical evidence | Workflow canvas as operator UI | Node authoring and app marketplace | AI application builder |
| LangSmith | Review queue, rubric, trace tree, side detail, dataset feedback | Technical jargon on operator screens | Raw payloads and token metadata by default | AI developer observability/evaluation |
| Sentry | Lifecycle status, culprit summary, breadcrumbs, event evidence | Error-centric language everywhere | Stack trace depth for normal operators | Software error diagnosis |
| Datadog | Faceted filters, saved views, time/status scoping | Query language-first UX, chart wall, dense global nav | Dozens of visualizations and monitors | Multi-product telemetry exploration |

Hard eliminations:

- No chat bubbles as the canonical task record.
- No node graph on Task Workspace.
- No KPI-card dashboard as the landing page.
- No rainbow status palette.
- No raw chain-of-thought display; show a concise decision summary, evidence, and recorded actions.
- No permanent three-column layout on laptop widths.
- No modal for long review work; approvals deserve a focused page or side sheet with preserved context.

---

# 3. Unified design philosophy

## 3.1 Philosophy: Quiet operational confidence

TravelOps uses a neutral, compact, evidence-first interface. AI is expressed through provenance and run status—not gradients, sparkles, robot icons, or glowing surfaces. The visual center is always the business task.

## 3.2 Decision winners

| Decision | Winning reference | TravelOps rule | Why |
|---|---|---|---|
| Sidebar | Linear | 232 px fixed/collapsible, task-first navigation | Fast switching without product-suite bloat |
| Task list | Linear + GitHub | Dense rows with title, task type, status, SLA, amount, assignee | Supports rapid scanning and keyboard operation |
| Task detail | Stripe | Object header + facts + evidence + actions + activity | Consequential work needs stable resource grammar |
| Approval UI | LangSmith + GitHub | Focused queue item with rubric, evidence, and explicit decision | Review must be structured, attributable, and fast |
| Timeline | Sentry + Vercel | Chronological events with expandable technical detail | Shows causality without dumping raw logs |
| Forms | Retool + GitHub Primer | Persistent labels, compact fields, inline validation | Operators need speed and unambiguous errors |
| Buttons | GitHub Primer | One primary action per region; danger is separate | Predictability and accessibility beat visual novelty |
| Status badge | GitHub | Text + icon + restrained tint | Never rely on color alone |
| Modal | Stripe | Only short confirmations; use side sheet/page for review | Preserves context and avoids cramped consequential work |
| Typography | Linear | Inter/system sans; tabular figures; monospace only for IDs/logs | Dense but readable operational UI |
| Spacing | GitHub Primer | 4 px base, mostly 8/12/16/24 | Consistent compact rhythm |
| Color | Stripe/GitHub | Neutral dominant, one blue action accent, semantic states | Builds trust and reduces AI-dashboard theatrics |
| Tables | Stripe | Sticky headers, sorting, saved filters, column control | Operational queues require repeatable views |
| Navigation | Linear | Shallow IA plus direct search/shortcuts | Five screens do not justify nested mega-navigation |
| Search | Stripe | Global identifier search plus field filters | Booking/customer/task IDs must resolve directly |
| Filtering | Datadog, simplified | Chips for status/type/assignee/SLA; advanced popover | Powerful without exposing a query language |
| Loading | GitHub | Shape-matched skeleton only after 300 ms | Avoid spinner flicker and layout shift |
| Errors | Sentry | Localize error, preserve data, provide retry/escalate | Operators must understand impact and next step |
| Empty states | Linear | Explain state and give one next action | Empty is operational status, not illustration space |

## 3.3 Information architecture

```text
TravelOps
├── Task Inbox
│   ├── My queue
│   ├── Unassigned
│   └── Saved views
├── Approvals
│   ├── Needs my review
│   └── Reviewed
├── Agent Runs
├── Technical Evidence
└── Policies
```

`Task Workspace` is reached from a task. `Approval Review` is reached from either the Approvals queue or a task. `Agent Run Timeline` is reached from a task’s Activity/Run link. Technical Evidence is a controlled secondary area, not primary navigation for every operator role.

---

# 4. Screen-by-screen blueprint

## 4.1 Task Inbox

**Purpose:** choose the next task and understand queue health without a dashboard detour.  
**Primary action:** open/claim the highest-priority actionable task.  
**Secondary actions:** filter, search, assign, snooze, bulk assign.

```text
┌ Sidebar ─────────┬ Task Inbox ─────────────────────────────────────────────┐
│ Task Inbox   24  │ My queue (18)           Search tasks, booking, customer │
│ Approvals      6 │ [Status] [Type] [SLA] [Assignee]       Saved view ▾     │
│ Agent Runs       ├──────────────────────────────────────────────────────────┤
│ Evidence         │ □ RF-1042  Refund · Flight cancelled    Due 18m  $284   │
│ Policies         │   Maria Santos · BA218 · AI ready       Needs approval  │
│                  ├──────────────────────────────────────────────────────────┤
│ Saved views      │ □ TC-1039  Ticket change · Date change   Due 42m         │
│ • SLA risk       │   David Lee · SQ321 · Gathering policy  In progress     │
│ • VIP            └──────────────────────────────────────────────────────────┘
```

Hierarchy: page/queue → search and filters → column header → task identity → customer/booking context → SLA/amount/status. Avoid cards; rows support comparison.

Journey: arrive → scan SLA/status → filter or keyboard-select → open task. Remember filters and column preferences per user.

Cognitive-load rationale: one work queue replaces overview charts. Status, SLA, and monetary risk appear in fixed columns; metadata does not move between rows.

States:

- Empty filter: “No tasks match these filters” + Clear filters.
- Empty queue: “You’re caught up” + View unassigned tasks.
- Loading: 8 row skeletons preserving columns.
- Error: inline banner above retained stale rows; “Last updated 10:42 · Retry.”

## 4.2 Task Workspace

**Purpose:** resolve one travel case using request context, booking data, policy evidence, and an AI-proposed action.  
**Primary action:** submit the proposed action for approval or execute an allowed action.  
**Secondary actions:** edit proposal, request information, assign, escalate, view full run.

```text
┌ Breadcrumb / task ID / status / SLA ───────────────────────────────────────┐
│ Refund request · RF-1042                          [Escalate] [Review action]│
│ Maria Santos · BA218 · USD 284.00 · Flight cancelled                      │
├ Main 68% ─────────────────────────────────┬ Context rail 32% ──────────────┤
│ Customer request                          │ Booking                         │
│ “Flight cancelled; requesting refund.”    │ Confirmed · BA218 · 14 Jul      │
│                                           │ Customer · VIP                  │
│ Recommended resolution                    │ SLA · 18 min                    │
│ Full refund: USD 284.00                    │                                │
│ Confidence: High                          │ Policy evidence                 │
│ Why: carrier cancellation qualifies...   │ Refund Policy §4.2              │
│                                           │ Waiver Rule WX-17               │
│ Proposed tool action                      │                                │
│ create_refund_request(...) [View payload] │ Missing / conflicts             │
├───────────────────────────────────────────┴────────────────────────────────┤
│ Activity preview · 6 events                         [Open full timeline →]  │
└────────────────────────────────────────────────────────────────────────────┘
```

Hierarchy: task status and SLA → customer intent → recommended outcome → cited policy → exact action payload → timeline. “AI reasoning summary” is a concise decision explanation, never hidden chain-of-thought.

Journey: read request → verify booking → inspect citations → inspect amount/action → review or escalate. Context rail remains sticky; on narrow screens it becomes tabs.

Cognitive-load rationale: separates narrative decision work from structured facts while keeping evidence visible. The primary action appears only after proposal and risk state are ready.

## 4.3 Approval Review

**Purpose:** make a safe, attributable decision on a proposed consequential action.  
**Primary action:** Approve and execute.  
**Secondary actions:** Reject, modify proposal, request information, return to queue.

```text
┌ Approval queue  3 of 6 ────────────────────────────────────────────────────┐
│ Refund USD 284.00 · RF-1042                     Reserved to you · 08:42    │
├ Evidence 65% ───────────────────────────┬ Decision 35% ────────────────────┤
│ Request + booking snapshot              │ Risk checks                      │
│ Policy §4.2 [quoted excerpt]             │ ✓ Booking exists                 │
│ Waiver WX-17 [quoted excerpt]            │ ✓ Carrier cancelled              │
│ Proposed tool + immutable payload        │ ! Amount > USD 100               │
│ Expected postcondition                   │                                 │
│ Audit history / previous decisions       │ Decision reason *               │
│                                         │ [________________________]       │
│                                         │ [Reject] [Modify]                │
│                                         │ [Approve and execute]            │
└─────────────────────────────────────────┴─────────────────────────────────┘
```

Approval rules:

- Never use a generic “Confirm?” modal.
- Display amount, customer, booking, exact tool, immutable parameters, policy citations, risk triggers, and expected postcondition.
- Require a reason for rejection/modification; require reason for approval only when policy demands it.
- Button label states the side effect: “Approve USD 284 refund,” not “Continue.”
- Re-authentication can occur after decision but before execution for high-risk actions.
- Show reservation/locking and stale-version conflicts.

Cognitive-load rationale: decision controls remain in a fixed rail while evidence scrolls. Risk checks are deterministic and separate from the AI recommendation.

## 4.4 Agent Run Timeline

**Purpose:** explain what the system did, where it paused or failed, and which evidence/actions produced the outcome.  
**Primary action:** inspect the failed/current step.  
**Secondary actions:** retry eligible step, copy correlation ID, open raw technical evidence, report incorrect result.

```text
Run AR-8821 · Completed with approval · 12.8s · 6 steps     [Copy run ID]

10:42:01  ✓ Task classified                     Refund request       220 ms
10:42:02  ✓ Booking retrieved                   get_booking         410 ms
10:42:03  ✓ Policy retrieved                    2 citations         680 ms
10:42:05  ✓ Eligibility calculated              Eligible            1.4 s
10:42:07  ◷ Approval requested                  Amount > USD 100     4m 12s
10:46:19  ✓ Approved by A. Rahman               Reason recorded
10:46:20  ✓ Refund request created              REF-77210           930 ms
```

Each event expands inline to show safe input/output, retry count, evidence, error, and correlation fields. Raw payloads are behind “Technical details,” redacted by default.

Cognitive-load rationale: business-language labels appear before technical operation names. Duration and failure sit in fixed positions; successful details stay collapsed.

## 4.5 Technical Evidence

**Purpose:** prove system behavior for reviewers, interviewers, QA, and engineering without polluting the operator workflow.  
**Primary action:** inspect or compare an evaluation/run.  
**Secondary actions:** filter, export evidence, open test details, add failure to evaluation dataset.

Tabs:

```text
Overview | Evaluations | Runs | Failure tests | Architecture evidence
```

Default Overview:

- latest verified build and commit;
- deterministic test totals;
- evaluation pass rate with dataset version;
- task success, policy compliance, citation validity, approval compliance;
- latency/cost distributions—not vanity totals;
- known limitations and last failed scenario.

Evaluation table columns:

```text
Scenario | Expected decision | Actual decision | Policy citation | Tool | Approval | Result | Version
```

Do not present a chart wall. Use small summary metrics only when clicking them opens the underlying cases. Every success claim links to evidence.

Cognitive-load rationale: separates operator work from engineering proof while retaining task/run links. Tabs map to distinct questions rather than visualization types.

---

# 5. Complete design system

## 5.1 Grid and shell

- Desktop canvas: fluid from 1024 px; content maximum 1600 px only for evidence tables.
- Sidebar: 232 px expanded, 56 px collapsed.
- Top context bar: 48 px.
- Primary page padding: 24 px desktop, 16 px tablet, 12 px mobile.
- Detail split: 68/32 with 24 px gutter; collapse below 1180 px.
- Approval split: 65/35; decision rail minimum 336 px.
- Table row height: 48 px compact default, 56 px when a secondary line is necessary.
- Content text measure: 68–76 characters.

## 5.2 Spacing tokens

Base unit: 4 px.

| Token | Value | Use |
|---|---:|---|
| `space-0` | 0 | Reset |
| `space-1` | 4 px | Icon/text micro-gap |
| `space-2` | 8 px | Inline controls, compact padding |
| `space-3` | 12 px | Row/cell vertical padding |
| `space-4` | 16 px | Component padding |
| `space-5` | 20 px | Dense section gap |
| `space-6` | 24 px | Page/section rhythm |
| `space-8` | 32 px | Major group separation |
| `space-10` | 40 px | Sparse page separation only |

No arbitrary 13/18/22 px spacing.

## 5.3 Border radius and elevation

- 4 px: badges, small inputs.
- 6 px: buttons, inputs, table containers.
- 8 px: panels, side sheets, dialogs.
- 12 px: only large empty-state or onboarding surfaces.
- Shadows are reserved for overlays: `0 8px 24px rgb(0 0 0 / 12%)`.
- Static cards use borders, not floating shadows.

## 5.4 Typography

Font: `Inter`, falling back to `ui-sans-serif, system-ui`. IDs/payloads: `ui-monospace, SFMono-Regular, Consolas`.

| Style | Size/line | Weight | Use |
|---|---|---:|---|
| Display | 24/32 | 600 | Rare top-level evidence title |
| H1 | 20/28 | 600 | Page/resource title |
| H2 | 16/24 | 600 | Section title |
| H3 | 14/20 | 600 | Panel title |
| Body | 14/20 | 400 | Default interface text |
| Body compact | 13/18 | 400 | Dense tables/timeline |
| Label | 12/16 | 500 | Field/metadata labels |
| Caption | 11/16 | 500 | Timestamp/supporting metadata |
| Code | 12/18 | 400 | IDs, payload snippets, logs |

Use tabular numerals for amounts, SLA, duration, and metrics. Never use all caps for headings; limited uppercase is allowed for 11 px machine/status metadata only.

## 5.5 Color system

Light mode base:

| Token | Value | Purpose |
|---|---|---|
| `bg-canvas` | `#F7F8FA` | App background |
| `bg-surface` | `#FFFFFF` | Panels/tables |
| `bg-subtle` | `#F1F3F5` | Secondary surfaces |
| `border-default` | `#D9DEE5` | Standard borders |
| `border-strong` | `#B8C0CC` | Focused structure |
| `text-primary` | `#17202A` | Main text |
| `text-secondary` | `#56616F` | Supporting text |
| `text-muted` | `#778291` | Timestamps/placeholders |
| `action` | `#2563EB` | Links/primary actions |
| `action-hover` | `#1D4ED8` | Hover |
| `focus` | `#3B82F6` | 2 px focus ring + offset |

Semantic states use text + icon + tint:

| State | Foreground | Background | Meaning |
|---|---|---|---|
| Success | `#16794A` | `#EAF7F0` | Completed/eligible |
| Warning | `#9A6700` | `#FFF4D6` | SLA risk/needs attention |
| Danger | `#C0362C` | `#FDEDEC` | Failed/denied/destructive |
| Info | `#2563EB` | `#EAF2FF` | In progress/informational |
| Neutral | `#56616F` | `#EEF1F4` | Queued/draft/not started |
| Purple | `#6D4AFF` | `#F0EDFF` | AI proposal only; never generic decoration |

## 5.6 Core components

### Cards and panels

- Default surface has 1 px border, 8 px radius, no shadow.
- Header/body/footer are optional and structurally aligned.
- Do not wrap every section in a card; use section headings and dividers first.

### Tables

- Sticky 40 px header, 48/56 px rows, 12–16 px horizontal cell padding.
- Left-align text; right-align currency, counts, and durations.
- First column selection, second column primary identity.
- Sort indicator is visible only on sortable columns.
- Row hover and selected state must remain distinguishable without color alone.
- Support column visibility, saved views, bulk actions, and keyboard selection.
- Pagination uses explicit item range; prefer cursor pagination server-side.

### Forms

- Labels always visible above input; placeholder is an example, never the label.
- 36 px compact inputs, 40 px default inputs; textarea grows to a defined max.
- Help text precedes errors; errors appear below the field and in a summary for submission failures.
- Disable only when the reason is obvious; otherwise let users act and explain validation.
- Preserve user input after server failure.

### Buttons

- Heights: 32 px compact, 36 px default, 40 px prominent.
- Variants: primary, secondary, quiet, danger, danger-secondary.
- One primary action per panel/decision region.
- Icon-only buttons require accessible name and tooltip.
- Loading buttons preserve width and label context; destructive actions never become unlabeled spinners.

### Icons

- Lucide-style 16 px default, 20 px navigation/empty state.
- Stroke width visually consistent at 1.75–2 px.
- Never use icons as sole status encoding.
- Use domain icons sparingly: plane, ticket, hotel, policy, refund; avoid robot/sparkle icons.

### Tags and badges

- Status badge: icon/dot + label, 20–22 px height, 4 px radius.
- Category tag: neutral border; no rainbow category assignment.
- Risk badge: semantic tint and explicit label such as “Approval required.”
- Limit visible tags in a row to two; summarize the rest as `+2`.

### Modal, drawer, side sheet

- Modal width 400–560 px for short confirmations/forms.
- Side sheet 480–640 px for contextual inspection or small edits.
- Full page for Approval Review and multi-step consequential work.
- Escape closes only non-destructive overlays; unsaved changes require warning.

## 5.7 Empty states

Formula:

```text
State title
One sentence explaining why it is empty
One primary recovery/next action
Optional text link
```

Examples:

- “No tasks need your review. New approval requests will appear here.”
- “No policy evidence found. Adjust the query or escalate for manual review.”
- “No runs match these filters. Clear filters.”

No illustrations unless onboarding truly benefits from one.

## 5.8 Loading

- Under 300 ms: no loading indicator.
- 300 ms–2 s: shape-matched skeleton preserving layout.
- Over 2 s: skeleton plus plain status text.
- Background refresh: subtle timestamp/spinner near refresh control; never blank existing content.
- Agent run: event-by-event status, elapsed time, and cancel/escalate when supported.

## 5.9 Error handling

Every error communicates:

1. What failed.
2. What data/action was affected.
3. Whether anything may have succeeded.
4. What the user can do next.
5. Correlation ID behind “Technical details.”

Example: “Refund creation timed out. No successful refund confirmation was received. The task remains open and no retry has been sent. Retry or escalate.”

Never show a success toast before postcondition verification.

## 5.10 Motion

- 120 ms hover/focus transitions; 160–200 ms drawer/popover entry.
- No spring/bounce motion.
- Timeline events appear without celebratory animation.
- Respect `prefers-reduced-motion` and remove non-essential transitions.
- Motion explains state change; it never decorates AI activity.

## 5.11 Dark mode

Dark mode is secondary, not launch-critical. Build semantic tokens from day one, but ship only after light-mode contrast and dense-table legibility pass.

- Canvas `#0F1318`, surface `#161B22`, subtle `#1D232C`.
- Borders `#303844`; text primary `#EDF1F5`, secondary `#AAB4C0`.
- Reduce semantic background saturation; preserve semantic text contrast.
- Never invert screenshots/documents automatically.

## 5.12 Accessibility

- WCAG 2.2 AA minimum; 4.5:1 body text, 3:1 large text and UI boundaries.
- Full keyboard support for sidebar, tables, filters, timeline expansion, and approval decisions.
- Visible 2 px focus ring with 2 px offset.
- Minimum pointer target 40×40 px even when the visual control is smaller.
- Status and validation use icon/text, never color alone.
- Announce async run/approval state changes through appropriate live regions without reading every token.
- Table headers and sort state are programmatic; bulk selection has accessible labels.
- Approval screen focus order follows evidence → risk → reason → action.
- Do not expose hidden model reasoning; accessible decision summaries use plain language.

---

# 6. Component inventory

## Foundation

`AppShell`, `Sidebar`, `ContextBar`, `PageHeader`, `Breadcrumbs`, `Tabs`, `Divider`, `ScrollArea`, `ResponsiveSplitPane`.

## Data and navigation

`DataTable`, `TableToolbar`, `ColumnPicker`, `SavedViewPicker`, `Pagination`, `GlobalSearch`, `FilterBar`, `FilterChip`, `CommandMenu`, `EmptyState`, `InlineBanner`.

## TravelOps domain

`TaskRow`, `TaskStatusBadge`, `TaskTypeTag`, `SlaIndicator`, `MoneyValue`, `BookingSummary`, `CustomerSummary`, `PolicyCitation`, `PolicyEvidenceList`, `RiskCheckList`, `ProposedActionCard`, `ToolPayloadViewer`, `PostconditionCard`.

## Approval

`ApprovalQueueIndicator`, `ApprovalDecisionRail`, `ReviewerReservation`, `DecisionReasonField`, `ApproveActionButton`, `RejectActionButton`, `ModifyProposalSheet`, `StaleApprovalBanner`.

## Agent/run evidence

`RunStatus`, `RunTimeline`, `RunEvent`, `RunEventDetails`, `ToolCallSummary`, `RetrievalSummary`, `TraceLink`, `CorrelationId`, `RedactedPayload`, `EvaluationResultBadge`, `MetricDefinitionPopover`.

## Inputs and feedback

`Button`, `IconButton`, `TextInput`, `TextArea`, `Select`, `Combobox`, `Checkbox`, `RadioGroup`, `DateTime`, `FormField`, `Toast`, `Dialog`, `SideSheet`, `Tooltip`, `Skeleton`.

Do not create a universal “AI card.” Compose explicit domain components instead.

---

# 7. Rules every future screen must follow

1. The business task is always more prominent than the agent.
2. Every screen has one primary user decision; secondary actions are visually subordinate.
3. Status must state both machine condition and operator implication when ambiguous.
4. Consequential actions show object, amount, exact side effect, evidence, and postcondition before execution.
5. AI recommendations always expose sources, uncertainty, and action payload—not hidden reasoning.
6. Operator screens use business language; technical identifiers remain available one level deeper.
7. Lists are tables/rows when comparison matters; cards are reserved for self-contained summaries.
8. Preserve context during errors, refreshes, drawers, and approval transitions.
9. Every loading, empty, and error state provides a clear next action or explains why none exists.
10. Never use color, icon, or position alone to communicate state.
11. Default density is compact but not cramped: 14 px body, 48–56 px rows, 4 px spacing system.
12. A new visual pattern requires a new user problem—not a new feature name.
13. Charts are allowed only when trend/comparison is the question; every metric links to underlying cases.
14. Modals are for short interruptions, never deep work.
15. Keyboard operation is a first-class path for repeat operators.
16. Raw prompts, payloads, and model metadata belong in Technical Evidence, not Task Workspace.
17. Do not claim completion until the external postcondition is verified.
18. Do not add a screen when a section, side sheet, saved view, or state transition is sufficient.

## Final verdict

TravelOps should look intentionally unremarkable at first glance: neutral surfaces, dense work lists, clear facts, restrained statuses, and obvious decisions. Its sophistication should become visible through preserved context, precise approval semantics, policy evidence, failure transparency, keyboard speed, and the ability to trace every action. That is what makes enterprise software feel professional.

## Primary evidence links

- [Linear Inbox](https://linear.app/docs/inbox)
- [Stripe Dashboard basics](https://docs.stripe.com/dashboard/basics?locale=en-GB) and [search](https://docs.stripe.com/dashboard/search)
- [GitHub Primer](https://primer.style/)
- [Vercel logs](https://vercel.com/docs/logs), [projects](https://vercel.com/docs/projects), and [activity log](https://vercel.com/docs/activity-log)
- [Retool docs](https://docs.retool.com/)
- [Open WebUI docs](https://docs.openwebui.com/)
- [Dify docs](https://docs.dify.ai/)
- [LangSmith trace views](https://docs.langchain.com/langsmith/view-traces) and [annotation queues](https://docs.langchain.com/langsmith/annotation-queues)
- [Sentry docs](https://docs.sentry.io/)
- [Datadog docs](https://docs.datadoghq.com/)
