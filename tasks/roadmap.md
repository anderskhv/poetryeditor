# Poetry Editor Roadmap

## Shipped

### AI Poetry Coach (Phase 1) — March 2026
- Per-poem coaching via Claude Sonnet 4.5
- Collection-level editorial letters
- Learning extraction (AI builds a profile of the poet over time)
- Conversation summaries for cross-poem awareness
- Freemium usage caps ($0.50 guest / $5 registered / unlimited admin+own key)

### First-Visit Experience — March 2026
- Philosophy card: AI limitations + "your vision comes first"
- Guest quick onboarding (2 questions, no account required)
- Skill level + poem stage context for adaptive coaching
- Updated marketing, SEO, welcome card

### Editorial Report System — March 2026
- Collection-level editorial assessment with 3 generalist AI editors
- Pre-flight questionnaire (ambition, section purposes, readiness, harshness, report style)
- Pipeline: spine analysis → 3 parallel editors → compare notes → debate → per-poem assessments → Sonnet synthesis
- Debate protocol with optional poet input mid-debate
- Report page with split view, status dots, poet input on every section
- Pre-flight answers persist per collection (Supabase for auth users, localStorage for guests)
- **Note**: Supabase migration still needs to be applied for full persistence

### Cloud Collections — March 2026
- Supabase-backed collections with sections, poems, versioning
- Drag-and-drop reordering (poems across sections)
- Inline editing for collection titles and section names (double-click, pencil icon on hover)
- ZIP export, share links with optional comments
- Version history per poem with restore capability

---

## Planned

### LLM-Enhanced Analysis (Phase 2)
**For registered users only.** Use Claude Haiku to post-process the client-side analysis:

- Verify cliche detection: is this phrase actually cliched in context, or intentionally subverted?
- Deepen metaphor analysis: identify figurative language the heuristics miss
- Assess intentional vs. accidental rule-breaking (e.g., broken meter for emphasis)
- Generate richer natural language summaries with specific craft observations
- Estimated cost: ~$0.005 per analysis pass (negligible against $5 cap)

**Why not for guests:** Keep analysis cost at zero for free tier. Client-side analysis is already useful. The LLM pass is a registered-user perk.

### Human Editor Marketplace (Phase 3)
Connect poets with professional editors for deeper manuscript work:

- Editors like Ceridwen Hall offer standardized products (chapbook evaluation, line editing, collection review)
- Poets submit work through the platform
- Async feedback delivered as editorial letters (PDF) + annotated manuscripts
- Payment via Stripe; platform takes a percentage
- Editor profiles with specialties, sample letters, ratings
- AI coaching explicitly positions itself as complementary: "For deeper editorial work, consider working with a human editor"

**Business model:** Platform fee (15-20%) on editor services
**Prerequisites:** Stripe integration, editor onboarding flow, review/rating system
**Timeline:** 2026 Q3+

### Skill Assessment Matrix (Phase 2.5)
Formalize the 5x5 skill/completeness matrix:

- AI can assess skill level from a collection (with heavy caveats and humility)
- Track progress over time: "Your imagery has become more grounded since we started working together"
- Visual dashboard showing growth areas
- Compare self-assessment with AI assessment (opt-in, never forced)

**Constraint:** Assessment must always be framed as observation, never judgment. The poet decides what matters.

---

## Ideas (not committed)

- **Submission tracker**: Track where poems have been submitted, response times, acceptance rates
- **Reading lists**: AI-curated poet recommendations based on the user's work and influences
- **Craft library**: Interactive explanations of concepts like spine, diction, volta, enjambment — linked from coaching conversations
- **Community features**: Opt-in poem sharing, peer feedback circles
- **Export**: Generate formatted chapbook PDFs from collections
