# Public Hazırlık

Bu repo public kullanıma uygun olacak şekilde hazırlanır, ama kapsamını dürüst
anlatmalıdır.

## Konumlandırma

- Community starter'dır, resmi OpenAI ürünü değildir.
- Güncel resmi Codex dokümantasyonuna dayalıdır.
- Lokal setup kitidir; managed enterprise policy ürünü değildir.
- Önce güvenli varsayılanlar gelir; hesap connector'larını kullanıcı bilinçli
  olarak açar.
- README ilk ekranında Deutsch, Español, English, Português (Brasil), Türkçe ve
  Français giriş noktaları, gerçek badge'ler, emoji aksanları ve public-safe
  animasyonlu SVG görseller bulunur.
- Senior çalışma standartları [docs/best-practices.tr.md](best-practices.tr.md)
  içinde dokümante edilir.

## Public Kullanıcı Gereksinimleri

- Clone-and-run komutları herhangi bir klasörden çalışır.
- Windows PowerShell ve Bash/WSL installer vardır.
- Installer'lar non-mutating preview destekler: PowerShell `-WhatIf`, Bash
  `--dry-run`.
- Kullanıcı herhangi bir global Codex, Agents veya Git target'ına yazmadan önce
  manifest tabanlı kurulum planını `npm run plan:install` ile inceleyebilir.
- Installer managed dosyaları replace etmeden önce backup alır.
- Directory replacement sadece yönetilen Codex/Agents target'larıyla sınırlıdır.
- Kullanıcı geçici `CODEX_HOME` ve `AGENTS_HOME` ile smoke test yapabilir.
- Local state, auth, session, memory, project trust veya private path
  yayınlanmaz.
- Authenticated MCP'ler kullanıcı bilinçli açana kadar disabled kalır.
- `package.json` içinde `private: true` kalır; yanlışlıkla npm publish engellenir.
- README görselleri `assets/` altında tutulur, accessible SVG metadata'sı ve
  reduced-motion fallback'li hafif motion içerir; private screenshot, sahte
  metrik veya lisanssız medya kullanılmaz.
- Kök README dil girişleri İngilizce, Türkçe, Almanca, İspanyolca, Brezilya
  Portekizcesi ve Fransızca için source-controlled tutulur; public landing page
  kırık veya placeholder locale linklerine dayanmaz.
- README locale tutarliligi makine gate'iyle kontrol edilir; her kok dil girisi
  ayni dil switcher'ini, install komutlarini, verification komutunu ve
  public-safe konumlandirmayi korur.
- GitHub issue ve pull request template'leri public-safe hatırlatmalar içerir.
- Blank issue'lar kapalıdır; bug, feature request, soru ve güvenlik raporları
  scope'lu public-safe akışlardan geçer.
- CODEOWNERS review routing için varsayılan public owner bilgisini tutar.
- Dependabot, GitHub Actions ve npm manifest update PR'ları için ayarlıdır.
- GitHub Actions dependency'leri full commit SHA ile pinlidir ve workflow
  validation tag-based action ref'lerini publish öncesi reddeder.
- Workflow validation, validation workflow'larinda herhangi bir `*: write`
  permission satirini reddeder; publish/release automation manuel kalir.
- Installable skill kaynakları `npm run verify:skills` ile offline kontrol
  edilir, `catalog/skills-lock.json` kaynak allowlist'ine yansitilir ve
  publication öncesi `npm run verify:skills:online` ile online çözdürülür.
- Version'lı release notları [docs/release-notes.tr.md](release-notes.tr.md)
  içinde tutulur ve `CHANGELOG.md` ile hizalı kalır.
- Task odaklı bilgi bankası makaleleri [kb/](../kb/README.tr.md) altında
  Türkçe ve İngilizce tutulur; böylece sık operatör kararları README veya
  release notes dosyalarını şişirmez.
- GitHub repo açıklaması, topic'leri, feature toggle'ları ve release metadata'sı
  [docs/github-settings.tr.md](github-settings.tr.md) içinde dokümante edilir.
- MCP katalog entry'leri Windows ve Unix Codex config template'leriyle
  karşılaştırılır.
- Uzman ajan katalog entry'leri Windows ve Unix Codex config template'leri ve
  incelenmis agent role dosyalariyla karsilastirilir.
- Supply-chain IOC taraması default check pipeline'ının parçasıdır.
- Release-readiness validation; release notes, GitHub settings docs, workflow
  hardening, Gitleaks gate dokumantasyonu ve artifact hygiene kontrol eder.
- Workflow-security validation checkout credential persistence, geniş write
  permission, implicit dependency install ve workflow icinden push/release/auth
  aksiyonlarini reddeder.
- Package-surface validation npm source payload'ini scripts disabled ve
  repo-local cache ile dry-run eder; public handoff scratch output, auth file,
  archive veya local agent state iceremez.
- `package.json` explicit source package allowlist tutar; boylece package
  dry-run'lari deterministic kalir ve ignored scratch output, local agent
  state, archive veya auth materyali sessizce pakete giremez.
- Plugin manifest'leri varsayilan olarak hook, MCP server, app, write-capable
  interface veya marketplace auth zorunlulugu bundle edemez.
- MCP validation floating npm spec, unpinned git launcher ve plugin `.mcp.json`
  drift'ini reddeder.
- Advisory-source rehberi; maintainer'ların release öncesi yeniden kontrol
  etmesi gereken upstream güvenlik, Codex, GitHub, PowerShell ve ECC
  karşılaştırma kaynaklarını dokümante eder.

## Maintainer Gereksinimleri

Push öncesi:

```bash
npm run check
npm run validate:release
node scripts/plan-install.mjs --all --json --redact-paths
git status --short
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```

Push sonrası:

```bash
git rev-parse HEAD
git -c http.sslBackend=openssl ls-remote origin refs/heads/main
```

Hash'ler aynı olmalı ve release notes oluşturmadan önce GitHub Actions run
başarılı olmalıdır.
