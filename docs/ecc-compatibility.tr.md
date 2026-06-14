# ECC Uyumluluk Ve Import Politikasi

Bu repo ECC'den ogrenebilir ama ECC'ye donusmemelidir. Starter Codex-only,
Windows-friendly, konservatif ve yazmadan once preview edilebilir kalir.

Kontrol tarihi: 2026-06-14.

## ECC Neyi Iyi Yapiyor

ECC genis bir cross-harness agent operating system'dir. Codex, Claude Code,
Cursor, OpenCode, Gemini, Zed ve diger harness'lar icin cok sayida skill, ajan,
command, hook, MCP konvansiyonu, install profile, target adapter, test ve
release gate paketler.

Alinabilecek yuksek sinyal fikirler:

- manifest tabanli install planlama
- plan/apply ayrimi
- target'a ozel install adapter'lari
- install-state preview
- manifest ve skill surface validation
- MCP config drift kontrolu
- plugin runtime limitlerini acik anlatan README dili
- manifest, kisisel path, Unicode safety ve supply-chain sinyallerini kontrol
  eden release gate'leri

## Bu Starter Neyi Kopyalamamali

ECC dosyalari, config'leri, hook'lari, MCP kataloglari, skill'leri, ajanlari veya
marketplace metadata'si toptan import edilmemelidir.

Kacinilacak desenler:

- installer icinde sessiz `npm install` gibi dependency installation
- starter'in acik Git guard flow'u disinda global `core.hooksPath` degisikligi
- `approval_policy = "never"` veya `profiles.yolo` gibi permisif profiller
- genis aktif MCP connector kataloglari
- account, database, browser, filesystem veya production connector'larini
  varsayilan enabled yapmak
- raw prompt, tool input, diff veya output kaydeden hook telemetry
- ECC lifecycle hook runtime'lari, `SessionStart` prompt injection,
  `hookSpecificOutput.additionalContext` veya learned-skill auto-injection
- `hooks`, `mcpServers`, `apps`, write-capable interface veya marketplace auth
  zorunlulugu tasiyan plugin manifest'leri
- floating package spec tasiyan plugin `.mcp.json` dosyalari veya unpinned
  git-based MCP launcher'lar
- review edilmis Codex, Agents ve opsiyonel Git-guard hedefleri disindaki
  install-plan destination'lari
- generated active config icinde unversioned veya `@latest` npm package spec
  kullanmak
- secret scan'i bozan credential sekilli ornekleri import etmek

## Guvenli Adaptasyon Kurallari

ECC'den esinlenen her degisiklik commit edilmeden once sunlari yanitlamalidir:

| Soru | Zorunlu cevap |
| --- | --- |
| Ne aliniyor? | Toptan klasor kopyasi degil, kucuk bir desen. |
| Nereye yazar? | Varsayilan repo-scoped; global write icin acik install flag gerekir. |
| Neyle cakisir? | Mevcut `~/.codex`, `~/.agents`, Git config, hook, MCP, skill veya plugin marketplace state'i. |
| Nasil preview edilir? | `npm run plan:install`, PowerShell `-WhatIf`, Bash `--dry-run` veya baska no-write komut. |
| Nasil backup alir? | Managed global file write'lari replace oncesi backup alir, kullanici acikca kapatmadikca. |
| Nasil dogrulanir? | `npm run check`, skill kaynagi degisirse `npm run verify:skills:online`, publish oncesi Gitleaks. |

## Mevcut ECC Kaynakli Adaptasyonlar

Bu starter yalniz guvenli alt kumeyi alir:

- `manifests/install-plan.json` Codex-only install yuzeyini, collision policy,
  risk, backup davranisi ve explicit flag'leri kaydeder.
- `scripts/plan-install.mjs` human veya JSON no-write install plan basar.
- `scripts/validate-install-plan.mjs` runtime dependency eklemeden manifest'i
  dogrular.
- `schemas/install-state-preview.schema.json` ve
  `scripts/validate-install-state-preview.mjs`, uretilen JSON preview icin
  stabil sozlesme saglar ama ECC'nin daha genis install-state lifecycle'ini
  import etmez.
- `scripts/security-audit.mjs` installer icinde implicit npm install,
  permisif Codex profile, `approval_policy = "never"`, unpinned npm MCP package
  spec'leri, lifecycle hook runtime'lari ve otomatik additional-context
  injection desenlerini reddeder.

## Resmi Codex Uyumu

Politika guncel resmi Codex yonlendirmesiyle uyumludur:

- `AGENTS.md` global, repo ve nested discovery order'a sahip kalici talimattir.
  Harici repolar kendi repo-local talimatlarini sahiplenmelidir.
- Skill'ler progressive disclosure kullanir. Description kisa ve scoped
  kalmalidir.
- Plugin'ler reusable skill, app, MCP server, asset ve hook dagitir; local
  plugin resmi OpenAI yayini anlamina gelmez.
- MCP server'lar `config.toml` icinde `enabled`, approval mode, env-backed auth,
  timeout ve tool allow/deny listeleriyle tutulur.
- Hook'lar lifecycle guardrail'dir ve trust review ister; primary security
  boundary degildir.
- Legacy `sandbox_mode` ayarlari ile beta permission profile'lar ayni template
  icinde karistirilmamalidir.

Kaynaklar:

- ECC repository: https://github.com/affaan-m/ECC
- Official Codex manual: https://developers.openai.com/codex/codex-manual.md
- Agent Skills: https://developers.openai.com/codex/skills
- Build plugins: https://developers.openai.com/codex/plugins/build
- MCP: https://developers.openai.com/codex/mcp
- Hooks: https://developers.openai.com/codex/hooks
- Permissions: https://developers.openai.com/codex/permissions
