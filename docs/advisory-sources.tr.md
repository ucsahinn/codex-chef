# Advisory Kaynakları

Bu starter dış güvenlik feed'lerini, authenticated connector'ları veya scheduled
scanner'ları otomatik açmaz. Advisory girdisi incelenebilir ve insan onaylı
kalır.

## Neyi Kontrol Etmeli

| Alan | Kaynak | Kullanım |
| --- | --- | --- |
| Codex davranışı | https://developers.openai.com/codex/codex-manual.md | Config, skills, MCP, hooks, rules, permissions, Windows ve noninteractive davranışı doğrula. |
| Codex config reference | https://developers.openai.com/codex/config-reference#configtoml | Config key'lerini, agent role bloklarini, config_file path'lerini ve guvenlik sinirlarini tekrar kontrol et. |
| OpenAI skill örnekleri | https://github.com/openai/skills | Skill yapısı ve progressive disclosure pattern'lerini karşılaştır. |
| MCP güvenliği | https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices | Connector consent, auth, SSRF ve confused-deputy risklerini incele. |
| GitHub secret scanning | https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning | Current-tree ve history-secret rehberliğini doğrula. |
| GitHub Actions güvenliği | https://docs.github.com/en/actions/reference/security/secure-use | Workflow permission ve token exposure alanını dar tut. |
| Windows PowerShell güvenliği | https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-shouldprocess | `-WhatIf` ve `SupportsShouldProcess` installer davranışını koru. |
| Public starter karşılaştırması | https://github.com/affaan-m/ecc | Sadece bu Codex-only scope'a uyan manifest, validation, docs ve release-gate pattern'lerini al. |

## Varsayılan Olarak Otomatikleştirme

- Credential veya token keşfi.
- Private account connector setup'ı.
- GitHub repository settings değişikliği.
- Package publication, release creation veya deploy.
- History rewrite veya destructive cleanup.
- Açık kullanıcı onayı olmadan global skill kurulumu.

## Release Kullanımı

Release tag'i oluşturmadan önce tekrar çalıştır:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
```

Ardından mevcut release notes ve GitHub settings rehberini yukarıdaki kaynaklarla
karşılaştır. Bir kaynak anlamlı şekilde değiştiyse publish öncesi ilgili docs,
template ve validation dosyalarını güncelle.
