# Skill'ler, Plugin'ler ve Uzman Ajanlar

## Skill'ler

Skill'ler tekrar kullanılabilir iş akışlarıdır. Codex bir skill'i seçene kadar
tam talimatları yüklemez; bu yüzden açıklamalar net, kısa ve tetiklenme koşulu
öne alınmış olmalıdır.

Resmi kaynak: https://developers.openai.com/codex/skills

Routing kurali:

- Kullanici `$skill` veya skill adini acikca yazarsa o secim onceliklidir.
- Implicit skill secimi `description` alanindan calisir; tetik kelimelerini
  basa koy, cunku Codex ilk context'te uzun skill listelerini kisaltabilir.
- Non-trivial gorev bir skill ile eslesiyorsa skill kullanimi zorunludur. Ana
  thread ayni isi manuel yapabilir diye ilgili skill atlanmaz.
- Skill secildikten sonra Codex tam `SKILL.md` dosyasini okumali; sonra sadece
  gorev icin gereken reference, template, script veya assetleri yuklemelidir.
- Tekrarlanabilir workflow icin skill kullan. Workflow MCP config, app mapping,
  asset veya lifecycle hook ile dagitilacaksa plugin olarak paketle.

Bu repo şunları içerir:

- `catalog/skills.json`: seçilmiş skill referansları, kategorileri ve varsa
  doğrulanmış public `package` + `skill` kurulum hedefleri.
- `catalog/agents.json`: Codex config template'leri icin incelenmis uzman ajan
  metadata'si, risk notlari, kullanim amaci ve drift beklentileri.
- `plugins/codex-chef-workflows/skills/codex-chef-operator`: bu
  kurulumu bakımda tutmak için küçük bir yerel skill.
- `plugins/codex-chef-workflows/skills/offline-diagram-triplet`: Mermaid
  kaynağından editable Excalidraw, SVG, PNG ve Markdown snippet üreten
  zero-network yerel diagram workflow'u.
- `plugins/codex-chef-workflows/skills/context-budget-planner`: büyük işlerde
  token/context planı, kaynak önceliği, compaction handoff'u ve verification
  gate'leri çıkaran yerel workflow.

## Bundled Skill Yapisi

Repo icindeki yerel skill'ler ayni iskeleti kullanir:

- `SKILL.md`: kisa tetik ve workflow talimati.
- `references/*.md`: sadece gerektiginde yuklenen detayli alan rehberi.
- `agents/openai.yaml`: Codex skill listeleri icin UI metadata ve default
  prompt.

`npm run validate:plugin-skills`, bu yapiyi, plugin manifestini ve
`catalog/skills.json` kaydini ayni hizada tutar.

## Plugin'ler

Bir iş akışı tek bir yerel klasörün ötesinde paylaşılacaksa dağıtım paketi
plugin'dir. Plugin'ler skill, MCP config, app entegrasyonu ve lifecycle
ayarlarını birlikte taşıyabilir.

Resmi kaynak: https://developers.openai.com/codex/plugins

Bu repo şunları içerir:

- `plugins/codex-chef-workflows/.codex-plugin/plugin.json`
- `.agents/plugins/marketplace.json`

Installer yerel marketplace kaydını kurar. Codex'i yeniden başlatıp `/plugins`
ile plugin'i inceleyebilir veya kurabilirsin.

Bundled plugin şu anda üç yerel skill sunar:

- `codex-chef-operator`: güvenlik sınırlarını zayıflatmadan bu starter'ı
  bakımda tutar.
- `offline-diagram-triplet`: network kullanmadan Mermaid source'u editable
  diagram triplet'ine çevirir.
- `context-budget-planner`: büyük repo, araştırma, çok ajanlı, dokümantasyon
  ağırlıklı veya uzun sürecek Codex işlerinde token/context kullanımını planlar.

Installer sadece `install: true`, `owner/repo` formatında doğrulanmış `package`
ve eşleşen `skill` adı taşıyan katalog kayıtları için Skills CLI çağırır.
Kullandığı format `npx skills add <package> --skill <skill> --agent codex --yes --global`
olduğu için düz skill ismi yanlışlıkla Git repository gibi clone edilmeye
çalışılmaz ve hedef ajan açıkça Codex olarak kalır.

`catalog/skills-lock.json` incelenmis kurulabilir kayitlari ve installer
komutlarini yansitir; fakat degistirilemez upstream commit lock'u degil, kaynak
allowlist'idir. Release oncesinde ve kaynak degisikliginden sonra `npm run
verify:skills:online` calistirilarak mevcut Skills CLI'in her package + skill
ciftini cozdugu tekrar kanitlanmalidir.

Varsayilan kurulabilir public ve first-party skill seti:

- `dependency-upgrade`: guvenli dependency bakimi.
- `gh-fix-ci`: resmi OpenAI GitHub Actions hata cozme workflow'u.
- `security-best-practices`: resmi OpenAI secure-defaults workflow'u.
- `systematic-debugging`: fix oncesi kok neden arastirmasi.
- `request-refactor-plan`: genis rewrite yerine kucuk adimli refactor planlama.
- `frontend-skill`: tek genis frontend uretim workflow'u.
- `webapp-testing`: Playwright kanitiyla local web-app dogrulamasi.
- `web-quality-audit`: Lighthouse tarzi web quality genel denetimi.
- `seo`: teknik SEO ve search discoverability.
- `accessibility`: keyboard, focus, form, ARIA ve semantic HTML kontrolleri.
- `test-driven-development`: davranis-oncelikli implementation workflow'u.
- `documentation-and-adrs`: README, ADR ve kalici docs workflow'u.
- `mcp-builder`: kaliteli MCP server tasarimi, tool schema'lari, transport ve
  evaluation akisi.
- `ai-project-starter`: first-party proje context temeli,
  starter docs, agent instruction dosyalari ve vibe-coding guardrail'leri.
- `prompt-architect`: first-party plan-first, approval-gated,
  security-aware Codex prompt paketleri ve prompt audit'leri.
- `ai-skill-create`: first-party skill authoring, validation,
  forward-testing, plugin packaging ve marketplace hazirligi.

Manuel opt-in referansları, daha özel workflow isteyen kullanıcılar için
katalogda görünür kalır:

- `impeccable`, `design-taste-frontend`, `image-to-code` ve
  `high-end-visual-design`: ekstra tasarım polish ve image-to-code workflow'ları.
- `web-design-guidelines`, `vercel-react-best-practices`, `vercel-optimize` ve
  `vercel-cli-with-tokens`: Vercel, React/Next.js, hosting ve deployment-token
  workflow'ları.
- `context-map` ve `what-context-needed`: ek context seçimi pattern'leri.
- `prompt-engineering-patterns` ve
  `ai-prompt-engineering-safety-review`: ek prompt tasarımı ve prompt safety
  review'ları.
- `memory-safety-patterns`: memory workflow güvenliği.

Manuel kurulum örneği:

```bash
npx skills add pbakaus/impeccable --skill impeccable --agent codex --yes --global
```

Offline diagram smoke doğrulaması online skill-source resolution'dan ayrıdır:

```bash
npm run validate:diagram
```

Token/context ayrimi onemlidir: bundled `context-budget-planner`, LLM context
butcesi ve compaction handoff isini cozer. `vercel-cli-with-tokens` gibi
deployment-token veya vendor-auth skill'leri hesap credential'i ve deployment
davranisi gerektirebildigi icin manual kalir.
Prompt veya skill routing degistirmeden once startup, config, agent-role,
skill, docs ve validation context agirligini gormek icin `npm run token:audit`
kullan.

Bundled yerel skill dogrulamasi public skill-source resolution'dan ayridir:

```bash
npm run validate:plugin-skills
```

## Uzman Ajanlar

Bu starter odaklı ajanlar kaydeder:

- `code_mapper`: büyük değişikliklerden önce read-only proje haritalama.
- `docs_researcher`: güncel doküman, API ve sürüm hassas bilgileri.
- `context_architect`: kalıcı davranışın prompt, `AGENTS.md`, skill, plugin,
  MCP, hook, memory, rule veya config profiline mi ait olduğunu belirleme.
- `prompt_architect`: güvenilir brief, başarı kriteri, prompt sistemi ve
  tekrar kullanılabilir instruction contract tasarımı.
- `mcp_integrator`: dış tool erişimi açılmadan veya debug edilmeden önce
  least-privilege MCP ve connector planlama.
- `product_strategist`: implementasyon oncesi urun framing'i, scope, basari
  kriteri ve en kucuk faydali surum kararlarini sorgular.
- `engineering_planner`: genis kod degisikliklerinden once mimari, data flow,
  diagram, edge case, invariant ve test stratejisini netlestirir.
- `design_reviewer`: UX kalitesi, accessibility, design-system uyumu, gorsel
  tradeoff ve AI-slop risklerini inceler.
- `devex_auditor`: onboarding friction, docs netligi, first-run flow ve
  time-to-hello-world deneyimini test eder.
- `root_cause_debugger`: fix oncesi hatayi reproduce eder, data flow izler,
  hypothesis test eder ve root cause cikarir.
- `qa_lead`: end-to-end workflow testleri, regression plani ve tekrar
  dogrulama yapar.
- `performance_auditor`: page speed, Core Web Vitals, resource budget, trace ve
  degisiklik sonrasi regression kaniti toplar.
- `google_seo_auditor`: crawlability, indexing, metadata, structured data, Core
  Web Vitals ve Search Console'a hazir fix'leri Google Search Central ve
  Lighthouse kanitiyla denetler.
- `docs_author`: Diataxis coverage, stale docs, release docs ve eksik rehber
  uretimi icin dokumanlari inceler.
- `spec_author`: belirsiz istegi non-goal, evidence, edge case ve quality gate
  iceren scoped executable spec'e cevirir.
- `code_reviewer`: doğruluk, regresyon ve eksik test review geçişi.
- `frontend_verifier`: tarayıcı, screenshot, layout ve etkileşim kontrolleri.
- `security_auditor`: auth, secret, API route, veri erişimi, izin ve abuse-path
  denetimi.
- `test_verifier`: lint, typecheck, test, build ve smoke kanıtı.
- `release_verifier`: Git hijyeni, artifact, secret scan ve publish gate'leri.
- `codex_doctor`: no-write starter sağlığı, catalog drift, install-plan, docs
  ve MCP tanılaması.

Resmi kaynak: https://developers.openai.com/codex/subagents

Agent katalog kurali:

- `catalog/agents.json`, paketlenen yirmi bir uzman ajan icin incelenmis
  kaynaktir.
- Catalog'daki ajanlar `modelSelection: auto` ve `modelReasoningEffort: auto`
  tasir; role TOML dosyalari `model` veya `model_reasoning_effort` pinlemez.
  Boylece aktif profil ve Codex runtime task'a uygun dengeyi secebilir.
- `catalog/agent-research-corpus.json`, her uzman ajanin domain focus, primary
  source type, refresh trigger, handoff hedefi ve reviewed authority-reference
  metadata'sini kaydeder.
- Her agent rol dosyasi acik source-refresh, cross-repo transfer,
  research-synthesis, adversarial-validation, source-currency ve
  corpus-expansion guidance ile expert-calibration gate'leri tasimalidir;
  boylece disaridan alinan pattern'ler gizli global davranisa degil, kanita
  dayali aksiyona donusur ve rol ciktilari senior-quality cizgisine vurulur.
- Her rol dosyasi ayrica `Authority metadata contract` ve
  `Expertise signal contract` bloklarini tasir; boylece ajan cagrildiginda
  kendi source marker'larini ve expertise signal'larini reviewed corpus
  metadata'sinin runtime formu olarak kullanir.
- Her authority reference ayrica `reviewCadenceDays` tasir; corpus validator
  global `dateChecked` degeri resmi docs, standart, vendor guide ve tool
  kaynaklari icindeki en siki cadence'den eskiyse fail eder.
- Daha genis repo, skill-example, local command, resmi proje-doc ve
  research-paper kaynaklari `supplementalResearchRefs` altinda kalir.
  Heuristic'leri ve validator tasarimini guclendirebilirler, ancak
  `authorityRefs` icine terfi edene kadar default runtime authority degildirler.
- Her ajan ayrica `decisionHeuristics`, `failureModes` ve
  `verificationSignals` icin `expertiseSignals` tasir. Bunlar source corpus'un
  ajanin davranisini nasil degistirecegini gosteren kisa runtime sinyalleridir.
- `scripts/validate-agent-config.mjs`, katalogdaki her ajanin hem Windows hem
  Unix config template'inde yer aldigini ve her `config_file` alaninin eslesen
  `templates/codex/agents/*.toml` role dosyasina gittigini kontrol eder. Ayrica
  pinlenmeyen model/reasoning secimini, her zorunlu runtime contract ve
  guardrail blogundan bir tane bulunmasini, rol dosyasi basina en az 100
  source-backed instruction item'i ve 20 distinct source marker olmasini
  zorunlu tutar.
- `scripts/validate-agent-research-corpus.mjs`, machine-readable corpus index'i
  `catalog/agents.json`, reviewed authority metadata'si ve role TOML
  dosyalariyla karsilastirir. Ayrica her ajan icin authority key'in o ajanin
  TOML promptunda bir source marker'a denk gelmesini zorunlu tutar, her source
  freshness cadence'ini staleness-risk sinifina gore kontrol eder ve stale
  corpus `dateChecked` degerlerini reddeder. Ayrica her bundled ajan icin her
  reviewed grupta en az uc expertise signal ister ve supplemental research
  ref'lerini freshness-checked ama non-authoritative input olarak dogrular.
- Gate ayrica agent template'lerinde tehlikeli default'lari engeller:
  `danger-full-access`, `approval_policy = "never"` ve role dosyalari icinde
  token environment variable adlari yoktur.

Routing kurali:

- Subagent kullanimi acik delegasyondur. Codex uygun uzman ajani yalnizca
  kullanici paralel/delege is isterse veya current runtime aktif gorev icin
  delegasyona acikca izin veriyorsa bilerek spawn etmelidir.
- Bu starter global AGENTS routing bolumunu routing policy ve hazirlik rehberi
  olarak ele alir; gizli auto-spawn izni degildir. Codex'in agent'lari sessizce
  olusturan background scheduler'i varmis gibi anlatmaz.
- Non-trivial is kayitli bir uzmana denk geliyorsa o uzman kullanilir ve sonucu
  kullanmadan once ozetlenir.
- Gorunur routing ciktisi `Agent plan`, `Agent started`, `Agent result`,
  `Skill selected`, `MCP selected` ve
  `Surfaces used: agents=..., skills=..., mcp=..., commands=..., skipped=...`
  satirlarini icermelidir.
- Lifecycle hijyeni bu kontratin parcasidir: artik gerekmeyen tamamlanmis agent
  thread'lerini kapat, buyuk isleri finallemeden once `/agent` ile aktif
  thread'leri incele veya kapat, background terminaller icin `/ps`, current
  session tarafindan baslatilan terminal islerini durdurmak icin `/stop`
  kullan. Serena gibi bir MCP process'i is bittikten sonra kalirsa bunu raporla
  ve process kill veya local state delete oncesi onay iste.
- En iyi alanlari gurultulu okuma ve kanit toplama isleridir: kesif, guncel
  docs, context yerlestirme, prompt tasarimi, MCP planlama, review, UI
  dogrulama, security audit, test/build kaniti, setup tanilama ve release
  hazirligi.
- Yazma agirlikli uygulama ana thread'de kalir. Kullanici acikca bolmeyi
  istemediyse birden fazla ajan ayni dosyalari edit etmemelidir.
- Subagent'lar onay, sandbox ve connector auth sinirlarini miras alir. Kullanici
  onayi, credential, destructive action veya dis sistem kontrolunu bypass etmek
  icin kullanilmaz.

Güvenlik notu: subagent'lar onayları, sandbox'ı veya connector auth sınırlarını
atlamaz. En iyi kullanım alanları okuma ağırlıklı keşif, context/prompt/MCP
planlama, log/test inceleme, UI doğrulama, güvenlik audit'i ve release öncesi
kanıt toplamadır.

## Enterprise Routing Profilleri

`catalog/routing-profiles.json`, ajan ekibini, curated skill'leri, MCP
varsayilanlarini ve config/profile flag'lerini birbirine baglayan reviewed
routing kontratidir. JSON audited mapping'i kaydeder; `templates/codex/AGENTS.md`,
config template'leri ve CLI routing panosu kontrati gorunur yapar. Su komutlarla gorunur:

```bash
npm run codex:routing
npm run codex:status
npm run chef -- --routing --profile starter-health
```

Her profil task trigger'ini, onerilen subagent'lari, delegation mode'u, skill
mode'u, MCP mode'u, beklenen flag/check'leri, evidence sinyallerini, owner,
durability, primary surface, privilege delta, validation gate, rollback path ve
guvenlik sinirini yazar. Bu Codex Chef'i faydali anlamda otonom yapar: task
shape profile uydugunda eslesen uzman, skill, MCP ve flag rehberligi zorunlu
olur. Gizli hook veya sessiz executor olusturmaz. Destructive, credential,
publish, deploy, database ve genis filesystem aksiyonlari onay kapisinda kalir.
