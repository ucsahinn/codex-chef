# Codex Kapasite Haritasi

Bu sayfa starter'in kurulumdan sonra Codex'i nasil daha guvenli ve kullanisli
bir calisma sistemine cevirdigini anlatir. Bu bir kurulum rehberi degildir. Her
Codex yuzeyinin hangi isi yapmasi gerektigini, hangi guvenlik siniriyla
tutuldugunu ve hangi lokal kontrollerle dogrulandigini gosterir.

Resmi kaynaklar:

- Codex customization sirasi: https://developers.openai.com/codex/concepts/customization
- Subagents: https://developers.openai.com/codex/subagents
- Skills: https://developers.openai.com/codex/skills
- Plugins: https://developers.openai.com/codex/plugins/build
- MCP ve connectors: https://developers.openai.com/api/docs/guides/tools-connectors-mcp
- MCP specification: https://modelcontextprotocol.io/specification

## Kapasite Katmanlari

| Katman | Ne icin kullanilir | Starter varsayilani | Dogrulama |
| --- | --- | --- | --- |
| Prompt/thread context | Tek seferlik gorev kisitlari | Aktif kullanici prompt'u en oncelikli sinyal kalir | Insan incelemesi |
| `AGENTS.md` | Kalici repo/global calisma anlasmalari | Repo-local onceligi koruyan incelenmis global rehber | `npm run validate` |
| `config.toml` | Model, sandbox, approval, MCP, feature ve profile ayarlari | Workspace-write sandbox ve on-request approval | `npm run validate:mcp` |
| Rules | Dar komut approval varsayilanlari | Sadece dogrulama komutlari; destructive/publish aksiyonlari gated | `npm run validate:content` |
| Skills | Progressive disclosure ile yeniden kullanilabilir workflow'lar | Curated install allowlist, local enterprise operator ve offline diagram skill | `npm run verify:skills` |
| Plugins | Paylasilabilir skill ve gelecekte bundled yuzey paketi | Tek local plugin, default hook/MCP/app yok | `npm run validate` |
| MCP/connectors | Canli docs, browser, code navigation ve dis sistemler | Docs/code/browser yardimcilari acik; auth isteyenler kapali | `npm run validate:mcp` |
| Subagents | Evidence-heavy uzman delegasyonu | Sandbox'li role dosyalariyla 20 incelenmis uzman ajan | `npm run validate:agents` |
| Doctor/status | No-write saglik ve drift ozeti | Default repo-only; opsiyonel global varlik kontrolu | `npm run codex:doctor` |

## Uzman Ajan Seti

Starter artik 20 uzman ajan tasir:

- `code_mapper`: buyuk degisikliklerden once read-only repo haritalama.
- `docs_researcher`: resmi/guncel dokuman ve version-sensitive bilgi.
- `context_architect`: prompt, AGENTS.md, skill, plugin, MCP, hook, memory,
  rule ve config bilgisinin nereye ait oldugunu belirleme.
- `prompt_architect`: guvenilir brief, basari kriteri, instruction contract ve
  yeniden kullanilabilir prompt sistemleri.
- `mcp_integrator`: least-privilege MCP ve connector planlama.
- `product_strategist`: urun framing'i, forcing question'lar, scope kararlari
  ve en kucuk faydali surum alternatifleri.
- `engineering_planner`: mimari, data flow, edge case, diagram ve test
  stratejisini kod oncesi netlestirme.
- `design_reviewer`: UX kalitesi, accessibility, design-system uyumu ve
  AI-slop tespiti.
- `devex_auditor`: onboarding friction, docs netligi, first-run flow ve
  time-to-hello-world kontrolu.
- `root_cause_debugger`: fix oncesi reproduce, data-flow tracing ve hypothesis
  testing.
- `qa_lead`: end-to-end workflow testleri, regression coverage ve
  re-verification planlari.
- `performance_auditor`: page speed, Core Web Vitals, resource budget, trace ve
  degisiklik sonrasi regression kaniti.
- `docs_author`: Diataxis coverage, stale-doc tespiti, release docs ve eksik
  rehber uretimi.
- `spec_author`: non-goal, evidence, edge case ve quality gate iceren scoped
  executable spec.
- `code_reviewer`: fresh-context correctness, regression, security ve test review.
- `frontend_verifier`: browser, screenshot, responsive layout ve console kaniti.
- `security_auditor`: read-only auth, secret, permission, data ve abuse-path review.
- `test_verifier`: lint, typecheck, test, build, smoke ve CI kaniti.
- `release_verifier`: git hygiene, artifact, secret scan, changelog/version ve publish gate.
- `codex_doctor`: starter sagligi, katalog drift'i, install-plan, docs ve MCP kontrolu.

Agent katalogu bilerek devasa tutulmadi. ECC ve wshobson/agents gibi yuksek
sinyalli repolar buyuk agent/skill kataloglarinin kataloglu, izole ve
composable oldugunda iyi calistigini gosteriyor. Bu starter o katalog disiplinini
alir; ama Codex-only default'lari korur ve genis cross-harness filolari, gizli
hook'lar, otomatik memory injection veya auth connector default'lari import etmez.

## Doctor Komutlari

No-write lokal saglik ozeti:

```bash
npm run codex:doctor
```

Makine-okunur cikti:

```bash
node scripts/codex-doctor.mjs --json --redact-paths
```

Global hedefler icin no-write varlik kontrolu:

```bash
node scripts/codex-doctor.mjs --include-global --redact-paths
```

Global kontrol sadece beklenen dosyalar var mi yok mu raporlar. Icerik okumaz,
skill kurmaz, Git config degistirmez, `~/.codex` veya `~/.agents` icine yazmaz.

## MCP Ve Connector Politikasi

OpenAI connector rehberi ve MCP specification, MCP server'lari ayri birer
capability boundary olarak ele alir. Bu starter dort kural uygular:

- Resmi veya yuksek sinyalli server'lari tercih et.
- Lokal package version'larini veya git source ref'lerini pinle.
- Account, filesystem, database, production ve billing-adjacent connector'lari
  somut gorev gerekene kadar kapali tut.
- Private data okuyabilen veya aksiyon alabilen her sey icin prompt-based
  approval ve dar tool exposure kullan.

Yeni connector eklerken `mcp_integrator` kullan. Config degismeden once onerilen
server, risk, auth siniri, approval mode, tool allowlist, dogrulama adimlari ve
rollback notlari donmelidir.

## Skill Ve Plugin Politikasi

Resmi plugin rehberi, iterasyon sirasinda local skill ile baslamayi; workflow
paylasilacak veya MCP/app/hook/asset paketlenecekse plugin kullanmayi onerir.
Bu repo bu ayrimi korur:

- Curated public skill'ler `catalog/skills.json` icinde kalir.
- Installable skill'ler reviewed `package`, `skill`, `sourceUrl`, `license`,
  `risk` ve `lastChecked` alanlarini tasimalidir.
- Local plugin default olarak enterprise operator skill'ini ve zero-network
  offline diagram triplet skill'ini sunar.
- Plugin hook, MCP server ve app yuzeyleri ayri review olmadan manifest'e girmez.

`/diagram` benzeri cikti gerektiğinde local renderer'i dogrudan calistir:

```bash
npm run diagram:triplet -- --mermaid path/to/diagram.mmd --out-dir artifacts/diagrams --name diagram-name
```

Network veya package install kullanmadan `.mmd`, `.excalidraw`, `.svg`, `.png`
ve `.md` dosyalari uretir.

## Neleri Import Etmez

Bu starter gelecekte ayri review ve dokumantasyon olmadan sunlari import etmez:

- Cross-harness global config sync.
- Genis skill marketplace import'lari.
- Varsayilan acik authenticated connector'lar.
- Plugin-bundled lifecycle hook'lar.
- Otomatik memory/session injection.
- Destructive cleanup, push, release, publish veya deploy otomasyonu.

## Dogrulama

Once odakli gate'leri calistir:

```bash
npm run validate:agents
npm run validate:mcp
npm run validate:doctor
npm run validate:diagram
npm run codex:doctor
```

Public release oncesi:

```bash
npm run check
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```

Online skill-source dogrulamasi ayri kalir:

```bash
npm run verify:skills:online
```
