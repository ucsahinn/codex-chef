# Araştırma Notları

Kontrol tarihi: 2026-06-14. Codex config reference icin 2026-06-15'te guncellendi.

Aşağıdaki bilgiler resmi dokümanlardan, standartlardan, olgun public
repolardan, araştırma makalelerinden ve practitioner issue sinyallerinden
gelir. Practitioner feedback sadece risk pattern'i olarak kullanılır; kaynak
otoritesi resmi dokümanların yerini almaz.

## Kaynaklar

| Başlık | URL | Tip | Güven | Neyi destekler | Eskime riski |
| --- | --- | --- | --- | --- | --- |
| Codex Manual | https://developers.openai.com/codex/codex-manual.md | Resmi OpenAI docs | High | surfaces, config, AGENTS.md, skills, plugins, MCP, hooks, rules, approvals, sandboxing, auth, Windows, noninteractive use, subagents | Medium |
| Codex Config Reference | https://developers.openai.com/codex/config-reference#configtoml | Resmi OpenAI docs | High | `agents.<name>.description`, `agents.<name>.config_file`, agent thread/depth/runtime default'lari ve config guvenlik sinirlari | Medium |
| Enterprise Context Core (ECC) | https://github.com/affaan-m/ecc | Public starter/toolkit repo | Medium/High | manifest-driven install planning, target adapter'ları, install-state preview, schema validation, MCP drift check'leri | High |
| Agent Skills - Codex | https://developers.openai.com/codex/skills | Resmi OpenAI docs | High | skill discovery, progressive disclosure, skill lokasyonları, plugin dağıtımı | Medium |
| Agent Skills Specification | https://agentskills.io/specification | Açık specification | High | `SKILL.md` alanları, opsiyonel dizinler, metadata, validation | Medium |
| openai/skills | https://github.com/openai/skills | Resmi public repo | High | curated skill örnekleri ve install beklentileri | Medium |
| Plugins - Codex | https://developers.openai.com/codex/plugins | Resmi OpenAI docs | High | skills, apps ve MCP metadata için plugin dağıtımı | Medium |
| Ajv JSON Schema Validator | https://ajv.js.org/ | Resmi proje dokümanı | Medium/High | JSON Schema validation tradeoff'ları ve bu starter'ın install-plan check'lerini npm install öncesi dependency-free tutması | Medium |
| MCP Security Best Practices | https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices | Resmi MCP guidance | High | consent, token/audience validation, SSRF, connector riski | Medium |
| GitHub Secret Scanning | https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning | Resmi GitHub docs | High | current-tree ve history secret scanning | Low/Medium |
| GitHub Actions Secure Use | https://docs.github.com/en/actions/reference/security/secure-use | Resmi GitHub docs | High | least-privilege workflow token'ları ve secret handling | Low/Medium |
| GitHub README guidance | https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes | Resmi GitHub docs | High | README içeriği, yardım linkleri, contribution beklentisi, relative links | Low |
| PowerShell ShouldProcess | https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-shouldprocess | Resmi Microsoft Learn | High | `-WhatIf`, `-Confirm`, daha güvenli mutating scriptler | Low/Medium |
| OpenSSF Scorecard | https://github.com/ossf/scorecard | Olgun public security projesi | Medium/High | public repo security-health gate fikirleri | Medium |
| ReAct | https://arxiv.org/abs/2210.03629 | Araştırma makalesi | Medium/High | reasoning ve tool-use birlikteliği | Low/Medium |
| Reflexion | https://arxiv.org/abs/2303.11366 | Araştırma makalesi | Medium/High | feedback, retry ve reflection loop'ları | Medium |
| Lost in the Middle | https://arxiv.org/abs/2307.03172 | Araştırma makalesi | Medium/High | progressive disclosure ve context placement disiplini | Medium |
| SWE-agent | https://arxiv.org/abs/2405.15793 | Araştırma makalesi | Medium/High | agent odaklı repo navigation, edit ve test interface'leri | Medium |
| openai/codex issues | https://github.com/openai/codex/issues | Practitioner issue tracker | Medium | Windows sandbox, PowerShell, MCP config ve AGENTS.md failure pattern'leri | High |

## Kaynaklı Kararlar

- `workspace-write`, `on-request` ve network-off default'ları korunur.
- Auth isteyen hesap, database ve broad filesystem MCP connector'ları default
  disabled kalır.
- Subprocess'ler geniş secret environment devralmasın diye
  `shell_environment_policy` eklenir.
- PowerShell `-WhatIf` ve Bash `--dry-run` ile installer ön izleme davranışı
  eklenir.
- Windows-safe Skills CLI çağrılarında `--agent codex` korunur.
- Online skill validation network ve dış package resolution kullandığı için
  offline validation'dan ayrı tutulur.
- Third-party skill kaynakları review edilebilsin diye `catalog/skills-lock.json`
  ve daha zengin catalog metadata'sı eklenir.
- Paketlenen uzman ajan config'i incelenebilir olsun ve Windows/Unix
  template'leriyle karsilastirilabilsin diye `catalog/agents.json` eklenir.
- MCP config explicit source, risk, auth ve approval metadata'sı olan bir trust
  boundary olarak ele alınır.
- ECC'nin manifest/plan/state fikri alınır; geniş global sync, otomatik
  dependency install veya default açık connector kapsamı içeri taşınmaz.
- Fresh clone üzerinde `npm run check` çalışabilsin diye install-plan validation
  dependency-free tutulur.
- Dokumante edilen connector inventory ile gercek Codex template'leri sessizce
  ayrismasin diye MCP catalog/config drift kontrolu eklenir.
- Remote shell pipe, download-execute, guvensiz destructive shell snippet,
  floating active package spec ve implicit installer dependency install
  desenleri icin bounded supply-chain IOC taramasi eklenir.
- README kısa ve taranabilir tutulur; troubleshooting, upgrade ve expected
  output detayları odaklı docs dosyalarına taşınır.
- Public issue tracker sinyalleri troubleshooting'i iyileştirmek için kullanılır,
  resmi Codex dokümanlarının yerine geçmez.
