# Enterprise Agentic Workflow UI/UX Design Bible

**Product:** TravelOps AI Worker  
**Status:** normative design source of truth  
**Audience:** product design, frontend, backend, QA, and product engineering  
**Companion specification:** [TravelOps UI/UX Blueprint](./TRAVELOPS_UI_UX_BLUEPRINT.md)

## How to use this document

This Bible defines why the interface behaves as it does. The companion blueprint defines the current screens and tokens. If a future screen conflicts with this document, either change the screen or record a deliberate design decision. Do not quietly invent a third pattern.

The product is successful when an operator can understand a task, verify evidence, make a safe decision, recover from failure, and prove what happened. Visual novelty is irrelevant.

---

# 1. UX foundations

## 1.1 Nielsen’s 10 usability heuristics

Nielsen’s heuristics exist because users do not experience software as its architecture. They experience a sequence of perceptions, decisions, actions, and consequences. Heuristics expose recurring failure modes in that sequence.

| Heuristic | Why it exists | Why enterprise products violate it | Application to TravelOps workflow software |
|---|---|---|---|
| Visibility of system status | People need a current model of what the system is doing | Background jobs, queues, integrations, and distributed services hide progress | Show task state, active step, elapsed time, approval wait, retry status, last refresh, and verified outcome |
| Match between system and real world | Familiar domain language reduces translation cost | Product teams expose database, framework, or vendor terminology | Say “Refund awaiting approval,” not `graph_interrupt`; “Booking not found,” not `404 tool error` |
| User control and freedom | Users make mistakes and change intent | Enterprise workflows often lock state or hide escape routes | Permit safe cancel, reject, reassign, return for information, and retry; expose irreversibility before action |
| Consistency and standards | Stable patterns become learned shortcuts | Teams ship modules independently and accumulate synonyms | One grammar for task status, approvals, evidence, timelines, and action buttons across all travel task types |
| Error prevention | Preventing costly action is better than explaining it afterward | Validation is deferred to APIs; confirmations are used as a substitute | Validate policy, amount, booking version, permissions, and idempotency before enabling execution |
| Recognition rather than recall | Recognition consumes less working memory than remembering hidden state | Filters, policy context, and previous steps disappear between pages | Keep booking facts, risk trigger, policy citations, and proposed action visible during review |
| Flexibility and efficiency | Novices need guidance; experts need acceleration | Products choose either wizard simplicity or expert density | Visible actions for new users; keyboard navigation, saved views, and bulk operations for frequent operators |
| Aesthetic and minimalist design | Irrelevant information competes with task-relevant evidence | “Enterprise” is mistaken for more cards, metrics, tabs, and controls | Show only fields that change prioritization or decision; place debug metadata behind disclosure |
| Help users recognize, diagnose, and recover from errors | Error codes do not provide a recovery model | Distributed failures are collapsed into “Something went wrong” | State what failed, what may have succeeded, current task state, safe recovery actions, and correlation ID |
| Help and documentation | Some domains cannot be made self-explanatory | Documentation is detached from the decision point | Put policy definitions, decision criteria, and action consequences beside the work; link to full SOP secondarily |

The common failure is treating these as a final QA checklist. They must shape state models and APIs. The UI cannot show a reliable execution state if the backend only exposes `running: true`.

Source: [Nielsen Norman Group heuristic summary](https://media.nngroup.com/media/articles/attachments/Heuristic_Summary1_A4_compressed.pdf).

## 1.2 Shneiderman’s eight golden rules

Shneiderman’s rules overlap Nielsen’s but emphasize operator agency, closure, reversibility, and frequent-use efficiency—especially relevant to software used eight hours a day.

1. **Strive for consistency.** Identical task states, controls, and terms must behave identically. Exceptions must be rare and explainable.
2. **Seek universal usability.** Support novice and expert paths, keyboard and pointer, accessibility needs, varying display sizes, and international travel data.
3. **Offer informative feedback.** Minor actions deserve quiet feedback; costly actions need explicit progress and verified completion.
4. **Design dialogs to yield closure.** A refund flow has a visible beginning, decision point, execution, postcondition, and terminal outcome.
5. **Prevent errors.** Constrain invalid actions and explain eligibility before submission.
6. **Permit easy reversal.** Reassignment, draft edits, filters, and review decisions should be reversible until an irreversible external action occurs.
7. **Support internal locus of control.** The operator initiates consequential action. The agent proposes; it does not hijack the workflow.
8. **Reduce short-term memory load.** Keep evidence and state in view; do not make reviewers remember another tab, previous modal, or hidden tool output.

Enterprise products violate these when automation erases agency, asynchronous jobs erase closure, or security controls are implemented as unexplained restrictions. TravelOps must make constraints legible: “Approval locked because the booking changed at 10:42” is control; a disabled button with no explanation is bureaucracy.

Source: [Ben Shneiderman’s Eight Golden Rules](https://www.cs.umd.edu/users/ben/goldenrules.html).

## 1.3 Gestalt principles

Gestalt principles exist because perception organizes visual stimuli before conscious reading.

- **Proximity:** fields placed together are interpreted as related. Booking facts, policy evidence, and approval controls need distinct groups; random card grids create false relationships.
- **Similarity:** equal visual treatment implies equal function. A destructive red button cannot share the same style as a neutral filter chip.
- **Common region:** bordered/background regions create strong grouping. Use them for a proposed action or decision rail, not around every paragraph.
- **Continuity:** aligned columns and timelines let the eye follow state. Stable table columns outperform differently shaped task cards.
- **Figure–ground:** the active task and current decision must separate from navigation and secondary metadata without excessive shadows.
- **Closure:** users infer complete shapes and processes. Explicit terminal workflow states prevent them from inventing whether an action finished.
- **Common fate:** simultaneous movement suggests related behavior. Avoid animated AI elements that imply coordinated progress when services are actually independent.

Enterprise violations come from component-driven design: every team adds another card, badge, divider, and color without considering the perceptual whole.

## 1.4 Hick’s Law

Decision time generally increases as the number and ambiguity of choices increase. The practical problem is not merely count; it is indistinguishable choices.

Application:

- one primary action per decision region;
- group secondary actions under clear intent, not a mystery kebab menu;
- use risk policy to remove impossible actions before review;
- split “Reject,” “Request information,” and “Escalate” because their outcomes differ;
- do not expose every tool to every task type.

Bad enterprise response: hiding all actions in dropdowns. This lowers visible count while increasing recall and discovery cost.

## 1.5 Fitts’s Law

Targets are faster to acquire when larger and closer. In an eight-hour workflow, small inefficiencies accumulate and tiny targets create errors.

Application:

- 40×40 px minimum pointer target even when the visual icon is 16 px;
- keep approval controls in a stable decision rail;
- place frequent row actions consistently;
- make the whole task row open the task, while keeping selection controls independent;
- separate destructive actions spatially from the primary action.

Do not make dangerous actions large merely to satisfy Fitts’s Law. Frequency and safety determine prominence together.

## 1.6 Miller’s Law and working memory

Miller’s “seven plus or minus two” is often abused as a fixed menu limit. It was about information-processing capacity under specific conditions, not a universal component rule; later work commonly finds lower working-memory capacity depending on the task.

The relevant principle is: **chunk information and externalize memory.**

Application:

- show a booking summary instead of making reviewers remember details from another page;
- chunk evidence by source and policy clause;
- keep the proposed action and risk trigger visible together;
- summarize successful timeline steps and expand exceptions;
- preserve filters, draft reasons, and scroll position.

## 1.7 Progressive disclosure

Progressive disclosure exists because not all information deserves equal timing or prominence.

TravelOps has three levels:

1. **Decision layer:** request, booking, policy evidence, risk, recommendation, action.
2. **Operational evidence:** tool inputs/outputs, retries, timestamps, actor, postcondition.
3. **Technical evidence:** raw payloads, model/provider metadata, tokens, spans, correlation IDs.

The failure mode is hiding required evidence under “Advanced.” Disclosure must follow task relevance, not technical complexity. Policy clauses required for approval stay visible even if their implementation is complex.

## 1.8 Information scent

Users follow cues that suggest where useful information lives. Labels must predict destinations and outcomes.

Strong scent:

- “Open booking record”
- “View 2 policy citations”
- “Retry eligibility check”
- “Approve USD 284 refund”

Weak scent:

- “Details”
- “Manage”
- “Continue”
- unlabeled icons

Enterprise products violate information scent with organizational labels, acronyms, and generic menus that reflect team boundaries instead of operator questions.

## 1.9 Cognitive Load Theory

Working memory is limited. UI creates:

- **intrinsic load:** unavoidable complexity of travel rules;
- **extraneous load:** complexity created by poor layout, terminology, and hidden state;
- **germane load:** effort spent learning useful domain patterns.

We cannot remove fare rules, but we can remove re-reading, cross-tab memory, inconsistent statuses, and duplicate confirmations. Stable task layouts turn repeated work into learned schemas, reducing future cognitive cost.

## 1.10 Recognition versus recall

Recognition displays the available object or option; recall requires retrieving it from memory.

Use:

- visible recent/saved filters rather than memorized query syntax;
- policy citations with excerpts rather than clause IDs alone;
- exact proposed tool payload rather than “the action discussed earlier”;
- status labels plus icons rather than color legend recall;
- booking/customer summaries beside decisions.

Search remains valuable, but it complements navigation; it must not become the only way to find core work.

## 1.11 Affordance

Affordance is the relationship between an object and possible action. A button should look actionable; a row should signal selection/opening; read-only evidence should not resemble an input.

Avoid false affordances:

- colored text that looks like a link but is not;
- cards that lift on hover but do nothing;
- editable-looking values in an immutable approval snapshot;
- disabled controls without a visible reason.

## 1.12 Feedback

Feedback closes the action loop. It must be proportional to consequence.

- Filter change: update count and chips quietly.
- Assignment: immediate row/state update with undo if safe.
- Approval: decision recorded, actor/time shown, execution begins as a separate visible phase.
- Tool action: show queued → running → external confirmation → verified outcome.
- Failure: retain context and expose recovery.

A toast is not enough for a consequential action because it disappears and cannot prove state.

## 1.13 Visibility of system status

Agentic systems add planning, retrieval, model calls, tools, queues, approvals, retries, and external APIs. A single spinner destroys the operator’s mental model.

Every long-running operation must expose:

- current business step;
- start and elapsed time;
- completed steps;
- waiting condition;
- whether user action is required;
- cancel/retry/escalation availability;
- last durable checkpoint;
- final postcondition verification.

---

# 2. Enterprise design principles hidden in great products

## Linear: speed comes from reducing decision friction

Linear feels fast because the object model, layout, shortcuts, and transitions are consistent. It does not ask users to re-interpret each page. Its Inbox supports direct work, quick search, snoozing, and keyboard navigation rather than sending users through a dashboard ([Linear Inbox](https://linear.app/docs/inbox)).

Lesson: perceived performance is partly cognitive. A 200 ms response still feels slow if the next action is unclear.

## Stripe: trust comes from object clarity and consequence clarity

Stripe makes identifiers, amounts, status, related objects, search filters, and event history inspectable. Search accepts object IDs and field-specific operators, matching how support and operations users actually investigate records ([Stripe search](https://docs.stripe.com/dashboard/search)).

Lesson: trust is not “clean visuals.” Trust is the ability to reconcile what the interface says with a real business object and event history.

## Retool: operator software is data adjacent to action

Retool works when it places a selected record, editable fields, and operational controls within one working context. Its power is not drag-and-drop; it is proximity between evidence and action.

Lesson: avoid separate “view,” “edit,” and “action” pages when safe inline or contextual action reduces navigation.

## GitHub: stable grammar scales information

GitHub uses repeatable resource headers, tabs, labels, lists, checks, reviews, and timelines. Users learn a system that transfers across repositories and objects. Primer encodes accessible component behavior rather than merely appearance ([GitHub Primer](https://primer.style/)).

Lesson: scale comes from a reusable interaction grammar, not from fitting more controls on screen.

## Vercel: progressive disclosure makes technical state approachable

Vercel separates project status, deployment summary, resources, build logs, runtime logs, activity, and audit history. Users start with outcome and drill toward evidence ([Vercel logs](https://vercel.com/docs/logs)).

Lesson: technical truth stays available without dominating the first layer.

## Datadog: complexity becomes manageable through scope

Datadog lets users constrain time, service, environment, status, facets, and queries before reading individual events. The UI remains dense because its work is investigative.

Lesson: filtering is not a table accessory; it is the primary mechanism for reducing an operational search space. TravelOps should borrow facets and saved views without importing query-language complexity.

## Sentry: aggregate noise into actionable units

Sentry converts many events into issues with lifecycle, severity, frequency, ownership, and evidence. It guides the user from symptom to culprit rather than presenting raw logs first.

Lesson: multiple agent/tool events belong to a task/run object. Operators should not triage spans.

## Notion: direct manipulation works when structure remains legible

Notion lets users manipulate content directly and uses predictable blocks, slash actions, and page hierarchy. Its flexibility reduces mode switching but can produce inconsistent information architecture.

Lesson: use direct editing for notes and structured corrections, but do not let operators freely redesign critical approval layouts.

## Open WebUI: conversational familiarity is powerful and dangerous

Open WebUI makes model interaction accessible through familiar conversation, streaming, and tool feedback. That familiarity can hide the absence of explicit business state.

Lesson: borrow responsive feedback, never the chat transcript as the canonical task or audit record.

## Dify: visual workflows help builders, not necessarily operators

Dify exposes node structure, variables, and execution logs, making AI workflow construction inspectable. The canvas is useful when the user’s job is authoring flows.

Lesson: show business steps to operators and node/run details to technical reviewers. Never force operators to understand implementation topology.

---

# 3. The 10 design principles of enterprise agentic workflow systems

## Principle 1 — Workflow before AI

**Explanation:** the task lifecycle is the product; AI is one bounded participant.  
**Why:** operators need ownership, status, deadlines, and terminal outcomes regardless of model behavior.  
**Good:** “Awaiting approval” remains durable if the model service is offline.  
**Bad:** a chat stops after “Would you like me to process the refund?” with no task state.  
**Implementation:** model tasks as explicit states and transitions; navigation starts with Task Inbox, not Chat.

## Principle 2 — Information before action

**Explanation:** evidence and consequences precede controls.  
**Why:** speed without informed action produces expensive errors.  
**Good:** booking, amount, policy clause, risk trigger, action payload, then approve.  
**Bad:** “Approve” at the top while evidence is hidden below.  
**Implementation:** decision rail stays disabled/incomplete until required evidence is present; missing evidence is explicit.

## Principle 3 — One primary action per decision region

**Explanation:** visual hierarchy identifies the expected next step without erasing alternatives.  
**Why:** ambiguous equal-weight actions increase decision time and errors.  
**Good:** “Approve USD 284 refund” primary; Reject and Modify secondary.  
**Bad:** Approve, Submit, Execute, Continue, and Save all styled primary.  
**Implementation:** enforce component/API review when a region contains multiple primary buttons.

## Principle 4 — AI explains before acting

**Explanation:** show conclusion, evidence, uncertainty, and proposed side effect before execution.  
**Why:** model authority must be earned and inspectable.  
**Good:** “Eligible under Refund Policy §4.2; carrier cancellation confirmed; proposes `create_refund_request`.”  
**Bad:** “AI recommends approval — 94% confident.”  
**Implementation:** require structured recommendation fields; never expose chain-of-thought or accept unsupported prose.

## Principle 5 — Human authority must be real

**Explanation:** approval changes what the system may do; it is not decorative confirmation.  
**Why:** false control destroys trust and governance.  
**Good:** the workflow durably pauses; reviewer identity, reason, version, and decision are recorded.  
**Bad:** action executes first and the UI asks for approval afterward.  
**Implementation:** backend policy gate and immutable approval snapshot; frontend cannot bypass it.

## Principle 6 — Stable layout creates expert speed

**Explanation:** repeated information stays in predictable positions across task types.  
**Why:** spatial memory reduces scan time and cognitive load.  
**Good:** status/SLA in header, work in main column, booking/evidence in rail, activity below.  
**Bad:** refund, change, and cancellation tasks each use a different card mosaic.  
**Implementation:** shared workspace template with typed extension slots, not arbitrary layouts.

## Principle 7 — Dense but readable

**Explanation:** enterprise density means high decision-relevant information per viewport, not tiny text.  
**Why:** excessive whitespace increases navigation; cramped controls increase mistakes.  
**Good:** 14 px body, 48–56 px task rows, fixed columns, compact metadata.  
**Bad:** giant KPI cards or 11 px body text.  
**Implementation:** compact/default density modes may vary row height, never typography below accessible baseline.

## Principle 8 — State and causality stay visible

**Explanation:** users can see what happened, in what order, by whom, and why the state changed.  
**Why:** agentic workflows cross asynchronous and external boundaries.  
**Good:** classification → retrieval → policy decision → approval → tool execution → verified outcome.  
**Bad:** spinner → success toast.  
**Implementation:** append-only business timeline linked to technical trace IDs.

## Principle 9 — Recovery is a primary path

**Explanation:** failure states receive the same design rigor as happy paths.  
**Why:** production work inevitably encounters timeouts, stale data, partial success, and policy ambiguity.  
**Good:** state preserved, possible side effect identified, retry eligibility explained, escalation available.  
**Bad:** “Something went wrong. Try again.”  
**Implementation:** design failure taxonomy and recovery transitions before visual polish.

## Principle 10 — Evidence beats AI theater

**Explanation:** trust comes from citations, records, tests, and verified outcomes, not anthropomorphic presentation.  
**Why:** animation and confidence scores cannot prove correctness.  
**Good:** policy excerpt, source version, booking snapshot, tool receipt, evaluation result.  
**Bad:** glowing avatar “thinking deeply.”  
**Implementation:** no robot/sparkle language in core workflows; every recommendation and success claim links to evidence.

---

# 4. AI UX principles

## 4.1 How AI interfaces differ from CRUD

Traditional CRUD usually has deterministic validation and immediate state changes. Agentic systems add probabilistic interpretation, generated plans, variable latency, partial observability, external tools, evidence retrieval, and uncertain outputs. Therefore:

- “valid schema” does not mean “correct decision”;
- progress cannot be represented by a single request spinner;
- retries may generate different outputs;
- approval must bind to a specific proposal/version;
- success requires verifying external state;
- explanations require evidence, not hidden reasoning;
- evaluation is part of product UX because users need calibration.

## 4.2 Human approval

- Trigger from deterministic risk policy where possible: amount, VIP status, missing data, policy conflict, low retrieval quality.
- Show immutable action snapshot, actor, amount, booking, policy, risk triggers, and expected postcondition.
- Approval expires or becomes stale when dependent data changes.
- Reject/modify/request-information are distinct outcomes.
- Reserve work to prevent conflicting reviewers; surface lock and expiry.
- Use re-authentication for high-risk actions without losing the decision context.

## 4.3 AI confidence

Confidence is not a decorative percentage. Model self-confidence is often poorly calibrated.

Prefer observable factors:

- retrieval coverage and citation validity;
- policy match/conflict;
- missing required fields;
- deterministic rule result;
- agreement with verified examples;
- out-of-distribution flags.

If a scalar is shown, define its source, threshold, calibration date, and operational consequence in a tooltip/detail. Never use “87% confidence” as permission to execute.

## 4.4 Reasoning visibility

Do not display private chain-of-thought. Display a **decision summary**:

```text
Conclusion
Key verified facts
Policy/rule applied
Uncertainty or missing information
Proposed next action
```

This is safer, more useful, and easier to audit than a verbose thought transcript.

## 4.5 Evidence display

- Cite source name, clause, version/effective date, and excerpt.
- Link the claim to the exact evidence span.
- Separate retrieved evidence from system inference.
- Mark conflicts and stale documents prominently.
- Do not bury “no evidence found” under a positive recommendation.
- Preserve the evidence snapshot used for the decision.

## 4.6 Tool execution

Every tool call shown to a human uses business language first and technical detail second:

```text
Create refund request
USD 284.00 to original payment method
Tool: create_refund_request
Idempotency key: available in Technical details
```

Lifecycle: proposed → policy checked → approval required/allowed → queued → running → external receipt → postcondition verified or failed.

## 4.7 Policy citation

- Citations are required for policy-dependent recommendations.
- Show enough excerpt to verify relevance without opening another screen.
- Indicate jurisdiction, carrier/product applicability, effective date, and supersession.
- Clicking opens surrounding context, not just a document homepage.
- If two clauses conflict, the UI says “Policy conflict” and blocks auto-execution.

## 4.8 Retry

- Retry is not always safe. Display whether the operation is idempotent and whether the previous attempt may have succeeded.
- “Retry eligibility check” differs from “Retry refund creation.”
- Preserve prior attempts in the timeline.
- Show retry count/backoff only in operational detail unless user action depends on it.
- Never silently switch provider/model and report a clean success; show degradation when material.

## 4.9 Failure recovery

Classify failures:

- validation failure;
- policy ambiguity;
- missing evidence;
- provider/model failure;
- tool/API timeout;
- confirmed external rejection;
- unknown/partial outcome;
- stale approval;
- postcondition failure.

Each class maps to allowed recovery: correct, retrieve, review, retry, reconcile, compensate, or escalate.

## 4.10 AI uncertainty

Uncertainty is expressed as a specific decision limitation, not vague hedging:

- “Cancellation cause is missing.”
- “Retrieved policy applies to domestic fares; this booking is international.”
- “Two waiver rules conflict.”

The interface then recommends a recovery path. “The AI may be wrong” as a permanent footer is legal theater, not useful uncertainty design.

## 4.11 Hallucination prevention in UX

UX cannot prevent hallucination alone, but it can prevent hallucinated content from becoming action:

- restrict choices to typed tools and validated IDs;
- visually distinguish source facts, computed values, and generated summaries;
- require citations for policy claims;
- refuse action when required facts are absent;
- show tool receipts and postconditions;
- allow “Report incorrect recommendation” and feed reviewed failures into evaluation.

## 4.12 Long-running tasks

- Show durable status independent of browser session.
- Let users leave and return without losing state.
- Notify only on meaningful transitions: action required, failed, or completed.
- Display waiting reason and expected/maximum wait if known.
- Support cancellation only when semantics are safe.
- Never fake progress percentages for unknown-duration model/tool work.

---

# 5. Component guidelines

## Sidebar

- Contains stable destinations, not every feature.
- Task Inbox and Approvals appear first with actionable counts.
- Saved views are subordinate and user-manageable.
- Collapse is optional expert preference; icons retain tooltips and accessible names.
- Never use a second permanent sidebar unless the information architecture truly has two stable levels.

## Navigation

- Use shallow hierarchy and resource breadcrumbs.
- Preserve task/queue context when opening details.
- Browser back must work predictably.
- Tabs represent peer views of the same resource, not steps in a workflow.
- Do not mix settings, creation actions, and navigation links in one group.

## Task list

- Rows, not cards, because comparison is the job.
- Fixed columns: identity, type, status, SLA, amount/risk, assignee, updated.
- Primary text carries task/customer meaning; IDs are secondary.
- Entire row opens; checkbox and inline actions have separate hit targets.
- Sticky headers, sorting, saved views, and keyboard traversal are required.

## Task workspace

- Stable resource header and status.
- Main column: request and recommendation.
- Context rail: booking, customer, policy, risk.
- Activity preview links to full timeline.
- Do not show raw prompt or model settings.

## Tables

- Use tables only when comparison across common fields matters.
- Left-align text; right-align numbers/currency/duration; use tabular numerals.
- Avoid horizontal scroll for core operator tables at supported desktop width.
- Column customization cannot hide identity or critical risk/status fields.
- Bulk actions appear only after selection and state their scope.

## Forms

- Persistent labels; placeholders are examples.
- Validate at the earliest reliable moment without interrupting every keystroke.
- Preserve values on server error.
- Show units, currency, timezone, and date format.
- Read-only values must not resemble editable fields.

## Search

- Global search resolves task, booking, customer, refund, and run IDs directly.
- Field filters support `status`, `type`, `assignee`, `booking`, `customer`, and dates.
- Search terms live in the URL for shareable/recoverable views.
- Recent items and exact matches precede fuzzy suggestions.

## Filters

- Common filters are visible chips; advanced filters use a popover.
- Active state is always visible, individually removable, and clearable.
- Display result count and distinguish “empty queue” from “no filter matches.”
- Saved views include sort, filters, and columns.

## Status badges

- Text + icon/dot + restrained semantic tint.
- State names are mutually exclusive at one lifecycle level.
- Avoid overloaded words such as “Pending” without pending reason.
- Do not use color as the only signal.

## Buttons

- Use verb + object for consequential actions.
- One primary button per decision region.
- Quiet buttons are for low-risk local actions; danger is visually and spatially separate.
- Loading preserves width and action label context.
- Disabled buttons provide adjacent reason or tooltip when not obvious.

## Dialogs

- Short confirmations and compact forms only.
- Title states consequence; body shows object and impact; action repeats the consequence.
- Deep approval, comparison, or evidence review gets a page or side sheet.
- Never stack dialogs.

## Approval cards and review

- A small card may summarize an approval in a task; the actual review uses a focused page.
- Show proposal version, exact side effect, policy basis, risk trigger, and reviewer state.
- Require reason according to policy, not universally.
- Stale data invalidates approval and explains what changed.

## Timeline

- Chronological business events; newest-last for causal reading inside a task.
- Icon, label, actor/system, timestamp, status, and duration align consistently.
- Success stays collapsed; failures and current waits expand by default.
- Technical details are linked, not mixed into event prose.

## Audit history

- Append-only presentation: actor, action, target, before/after or proposal version, reason, timestamp.
- Clearly distinguish human, system rule, agent, and external provider.
- Audit export must not alter the record.
- Redactions are marked, not silently removed.

## Agent execution trace

- Business step name precedes run/span name.
- Show model/tool/retrieval type, duration, result, retry, and error.
- Inputs/outputs default to redacted summaries.
- Nested spans collapse; current/failed path remains visible.
- Trace belongs in Technical Evidence or linked run detail, not primary workspace.

## Loading and skeleton

- No indicator under 300 ms.
- Skeleton matches stable layout and appears only when content shape is known.
- Background refresh retains existing data and shows last-updated state.
- Do not use skeletons for errors or authorization failures.

## Error

- Local error near affected component; page banner only for page-level impact.
- Explain failure, possible side effect, retained state, and safe next step.
- Correlation ID lives under technical details.
- Never erase evidence or form input.

## Empty state

- Distinguish first use, completed work, no permission, and no filter results.
- One explanation and one next action.
- No decorative illustration by default.

## Notifications

- Notify only for assignment, approval required, SLA breach risk, failure requiring action, or completion requested by the user.
- In-app Inbox is canonical; email/Slack are delivery channels linking back to the task.
- Group repeated events and suppress background success noise.
- Every notification states object, transition, required action, and urgency.

---

# 6. Design system philosophy

## Typography

- Inter/system sans for interface; system monospace for IDs, payloads, and logs.
- 14/20 px default body; 13/18 compact table metadata; 12/16 labels; 20/28 page titles.
- Tabular numerals for money, SLA, duration, and evaluation metrics.
- Hierarchy comes from size, weight, and spacing—not five text colors.

## Spacing

- 4 px base with 8, 12, 16, 24, and 32 px dominant increments.
- Spacing communicates relationship: 8–12 within a component, 16–24 between groups, 24–32 between sections.
- Do not use whitespace as luxury branding; operator screens need controlled density.

## Density

- Default task rows 48–56 px.
- Inputs 36–40 px high with minimum 40×40 pointer targets.
- Compact means fewer decorative gaps, not illegible type.
- A future comfortable-density option may increase row/padding, but structure remains identical.

## Color usage

- Neutral canvas and surfaces dominate.
- One action blue; semantic green/amber/red/blue/neutral; purple reserved for AI proposal identity when necessary.
- Color describes state, never product excitement.
- Semantic backgrounds are low saturation; text meets WCAG contrast.

## Icon philosophy

- Simple outlined 16/20 px icons.
- Icons aid recognition but never replace labels for unfamiliar or consequential actions.
- Avoid robot, magic wand, sparkle, brain, and glowing AI symbols in core workflow.
- Domain icons are used sparingly and consistently.

## Cards

- Cards represent one bounded object or summary, not every section.
- Static surfaces use borders, not floating shadows.
- Do not create an “AI card”; use `Recommendation`, `PolicyEvidence`, and `ProposedAction` components.

## Tables

- Tables are first-class interaction surfaces with sticky headers, filters, saved views, selection, accessible sort, and stable columns.
- Summary metrics never replace the underlying task table.

## Forms

- Explicit labels, units, constraints, validation, and recovery.
- Forms use sections based on operator decisions, not database tables.
- Confirmation displays the submitted values for consequential changes.

## Action hierarchy

- **Primary:** expected next safe action.
- **Secondary:** valid alternative without destructive consequence.
- **Quiet:** contextual/local utility.
- **Danger:** destructive or hard-to-reverse; separate and explicit.
- Action hierarchy is semantic, not simply a color choice.

## Motion

- 120–200 ms functional transitions.
- Motion explains entry, expansion, reordering, or status change.
- No bounce, shimmer beyond skeleton loading, celebratory confetti, or animated AI “thinking.”
- Respect reduced-motion preferences.

## Dark mode

- Semantic token architecture from the start; light mode is the launch quality bar.
- Dark mode ships only after table, form, policy excerpt, semantic state, and focus contrast testing.
- Do not automatically invert documents or evidence images.

## Accessibility

- WCAG 2.2 AA minimum.
- Complete keyboard paths for queue, filters, workspace, review, and timeline.
- Visible focus, programmatic names, semantic headings, form associations, table structure, and status announcements.
- Never rely on color, hover, drag, or pointer precision alone.
- Async announcements are concise; streaming token output is not continuously announced.

## Responsiveness

- Desktop/laptop is primary because operators perform dense work.
- At narrower widths, context rail becomes tabs/accordion; evidence is never removed.
- Tables prioritize critical columns and offer a detail row rather than microscopic compression.
- Mobile supports triage, review notification, and emergency approval only if security/policy permits; it is not a full parity goal by default.

---

# 7. Anti-patterns

## Dashboard obsession

**Failure:** landing page filled with KPIs while actionable tasks are another click away.  
**Why:** operators manage exceptions, not admire aggregate numbers.  
**Rule:** Task Inbox is home; queue health appears as small contextual counts.

## Too many charts

**Failure:** pie charts for status distributions and line charts without operational decisions.  
**Why:** charts consume space and obscure individual cases.  
**Rule:** a chart is allowed only when trend/comparison answers a real question and links to cases.

## Chat-first UI

**Failure:** business state lives in a transcript.  
**Why:** conversations are poor at comparison, ownership, deadlines, structured approval, and audit.  
**Rule:** chat may capture a request, but it creates/updates a task with explicit state.

## AI magic without explanation

**Failure:** “AI recommends refund” with sparkle styling.  
**Why:** recommendation lacks evidence and consequence.  
**Rule:** show verified facts, citation, uncertainty, and proposed action.

## Hidden system state

**Failure:** spinner or “processing” while tools, approvals, and retries happen invisibly.  
**Why:** users cannot decide whether to wait, retry, or escalate.  
**Rule:** expose durable business steps and waiting conditions.

## Overloaded navigation

**Failure:** every service, model, tool, dataset, and setting becomes a top-level item.  
**Why:** architecture leaks into user information architecture.  
**Rule:** navigate by operator work: tasks, approvals, runs/evidence, policies.

## Confirmation spam

**Failure:** “Are you sure?” for routine reversible actions.  
**Why:** users habituate and dismiss truly important confirmations.  
**Rule:** confirmations are proportional to consequence; prefer undo for reversible actions.

## Excessive animation

**Failure:** animated agents, pulsing nodes, streaming every internal thought.  
**Why:** distraction masquerades as system visibility.  
**Rule:** motion communicates state change only.

## Glassmorphism

**Failure:** translucent layers, blurred backgrounds, weak boundaries.  
**Why:** harms contrast, density, and durable hierarchy.  
**Rule:** solid surfaces, borders, and restrained elevation.

## Fake enterprise aesthetics

**Failure:** dark navy dashboards, dozens of cards, tiny gray text, gradients, and meaningless “AI confidence” gauges.  
**Why:** enterprise trust is confused with visual seriousness.  
**Rule:** prove trust through state, evidence, permissions, audit, and recovery.

## Card mosaic

**Failure:** every field in a separate card.  
**Why:** destroys comparison and creates excessive containers.  
**Rule:** use sections, definition lists, tables, and a few bounded panels.

## Raw chain-of-thought

**Failure:** exposing verbose hidden reasoning as transparency.  
**Why:** it can be misleading, sensitive, and cognitively expensive.  
**Rule:** structured decision summary plus evidence and action record.

## Silent fallback

**Failure:** provider/model/tool silently changes after failure and UI reports normal success.  
**Why:** hides degradation and changes behavior without operator awareness.  
**Rule:** material fallback is an event with reason and outcome.

## Success before verification

**Failure:** toast says “Refund completed” after request acceptance only.  
**Why:** request receipt is not business success.  
**Rule:** distinguish accepted, processing, externally confirmed, and verified.

---

# 8. Final design checklist

Use this checklist for every screen and material workflow change.

## Workflow and purpose

- [ ] Is the operator’s job on this screen expressible in one sentence?
- [ ] Is the business task more prominent than AI/system mechanics?
- [ ] Is there exactly one primary action per decision region?
- [ ] Are beginning, current state, and closure explicit?
- [ ] Can the user safely leave and return?

## Information hierarchy

- [ ] Is required information visible before consequential action?
- [ ] Are object identity, status, owner, SLA, and risk easy to find?
- [ ] Are facts, evidence, inference, and proposed action visually distinct?
- [ ] Does progressive disclosure hide only secondary detail?
- [ ] Are labels specific enough to predict destination or outcome?

## AI and evidence

- [ ] Does every policy-dependent recommendation cite an applicable source?
- [ ] Is uncertainty stated as a specific missing/conflicting fact?
- [ ] Is confidence calibrated and operationally meaningful—or omitted?
- [ ] Is the exact tool action visible before approval?
- [ ] Is chain-of-thought excluded in favor of a decision summary?
- [ ] Can a user report an incorrect recommendation?

## Approval and safety

- [ ] Does approval bind to a proposal/data version?
- [ ] Are actor, reason, timestamp, risk trigger, and expiry recorded as needed?
- [ ] Can stale/conflicting approval be detected?
- [ ] Are irreversible actions clearly separated and named?
- [ ] Is success shown only after postcondition verification?

## Feedback and recovery

- [ ] Does every action produce proportional feedback?
- [ ] Are long-running steps, waits, retries, and required intervention visible?
- [ ] Does every error say what failed, what may have succeeded, and what to do?
- [ ] Is user input/context preserved after failure?
- [ ] Are safe retry, reconcile, compensate, and escalate paths distinguished?

## Components and consistency

- [ ] Does the screen reuse established task, status, evidence, approval, and timeline grammar?
- [ ] Is a new component solving a new interaction problem?
- [ ] Are rows used for comparison and cards only for bounded objects?
- [ ] Are action hierarchy and semantic colors consistent?
- [ ] Are empty, loading, error, disabled, stale, and permission states designed?

## Accessibility and efficiency

- [ ] Can the complete workflow be operated by keyboard?
- [ ] Are focus, labels, headings, status, errors, and table structure programmatic?
- [ ] Do text and controls meet WCAG 2.2 AA contrast and target requirements?
- [ ] Are expert shortcuts additive rather than required?
- [ ] Does the layout remain usable at supported laptop widths and zoom levels?

## Evidence of quality

- [ ] Has the design been tested with realistic refund/change/booking scenarios?
- [ ] Has at least one failure, partial-success, stale-data, and approval-conflict case been tested?
- [ ] Can every success metric open its underlying cases?
- [ ] Are known limitations documented instead of hidden?
- [ ] Does the implementation prove the intended state model rather than simulate it visually?

## Final rule

When choosing between making the system look intelligent and making the operator feel in control, choose operator control. Human-centered AI aims for high automation and high human control rather than treating them as opposites ([Shneiderman, Human-Centered AI](https://arxiv.org/abs/2002.04087)).

