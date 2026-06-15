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
- `plugins/codex-enterprise-workflows/skills/enterprise-codex-operator`: bu
  kurulumu bakımda tutmak için küçük bir yerel skill.
- `plugins/codex-enterprise-workflows/skills/offline-diagram-triplet`: Mermaid
  kaynağından editable Excalidraw, SVG, PNG ve Markdown snippet üreten
  zero-network yerel diagram workflow'u.

## Plugin'ler

Bir iş akışı tek bir yerel klasörün ötesinde paylaşılacaksa dağıtım paketi
plugin'dir. Plugin'ler skill, MCP config, app entegrasyonu ve lifecycle
ayarlarını birlikte taşıyabilir.

Resmi kaynak: https://developers.openai.com/codex/plugins

Bu repo şunları içerir:

- `plugins/codex-enterprise-workflows/.codex-plugin/plugin.json`
- `.agents/plugins/marketplace.json`

Installer yerel marketplace kaydını kurar. Codex'i yeniden başlatıp `/plugins`
ile plugin'i inceleyebilir veya kurabilirsin.

Bundled plugin şu anda iki yerel skill sunar:

- `enterprise-codex-operator`: güvenlik sınırlarını zayıflatmadan bu starter'ı
  bakımda tutar.
- `offline-diagram-triplet`: network kullanmadan Mermaid source'u editable
  diagram triplet'ine çevirir.

Installer sadece `install: true`, `owner/repo` formatında doğrulanmış `package`
ve eşleşen `skill` adı taşıyan katalog kayıtları için Skills CLI çağırır.
Kullandığı format `npx skills add <package> --skill <skill> --yes --global`
olduğu için düz skill ismi yanlışlıkla Git repository gibi clone edilmeye
çalışılmaz.

`catalog/skills-lock.json` incelenmis kurulabilir kayitlari ve installer
komutlarini yansitir; fakat degistirilemez upstream commit lock'u degil, kaynak
allowlist'idir. Release oncesinde ve kaynak degisikliginden sonra `npm run
verify:skills:online` calistirilarak mevcut Skills CLI'in her package + skill
ciftini cozdugu tekrar kanitlanmalidir.

Offline diagram smoke doğrulaması online skill-source resolution'dan ayrıdır:

```bash
npm run validate:diagram
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

- `catalog/agents.json`, paketlenen yirmi uzman ajan icin incelenmis kaynaktir.
- `scripts/validate-agent-config.mjs`, katalogdaki her ajanin hem Windows hem
  Unix config template'inde yer aldigini ve her `config_file` alaninin eslesen
  `templates/codex/agents/*.toml` role dosyasina gittigini kontrol eder.
- Gate ayrica agent template'lerinde tehlikeli default'lari engeller:
  `danger-full-access`, `approval_policy = "never"` ve role dosyalari icinde
  token environment variable adlari yoktur.

Routing kurali:

- Subagent kullanimi acik delegasyondur. Kullanici paralel/delege is isterse
  veya aktif global setup task-shape routing'e izin veriyorsa Codex uygun uzman
  ajani bilerek spawn etmelidir.
- Non-trivial is kayitli bir uzmana denk geliyorsa o uzman kullanilir ve sonucu
  kullanmadan once ozetlenir.
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
