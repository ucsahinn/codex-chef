# Yerel Denetim - 2026-06-10

Bu normalize edilmiş denetim, önceki global Codex çalışmasının nereye yazıldığını
açıklar.

## Masaüstü Araması

Bu repo oluşturulmadan önce Masaüstü'nde yalnızca bir eşleşen dizin bulundu:

```text
~/Desktop/codex-cli-best-practice-main
```

Mevcut `codex-chef` repo'su yoktu.

## Güncel Global Codex Dosyaları

Canlı kurulumda zaten ciddi bir global config vardı:

```text
~/.codex/AGENTS.md
~/.codex/config.toml
~/.codex/SECURITY_OPERATIONS.md
~/.codex/rules/default.rules
~/.codex/agents/code_mapper.toml
~/.codex/agents/code_reviewer.toml
~/.codex/agents/docs_researcher.toml
~/.codex/agents/frontend_verifier.toml
~/.codex/agents/security_auditor.toml
~/.codex/agents/test_verifier.toml
~/.codex/agents/release_verifier.toml
```

Config şunları içeriyordu:

- `model = "gpt-5.5"`
- `approval_policy = "on-request"`
- `sandbox_mode = "workspace-write"`
- memories, hooks ve multi-agent davranışı için feature tabloları
- OpenAI docs, Context7, Playwright, Chrome DevTools, Serena, sequential
  thinking, memory, filesystem ve Supabase için MCP kayıtları
- GitHub, Figma, Linear, Notion, Sentry ve Vercel için kapalı connector
  presetleri
- public starter repo'ya kopyalanmaması gereken project trust ve hook state'i

## Güncel Skill Konumları

Skill'ler iki yerde bulundu:

```text
~/.codex/skills
~/.agents/skills
```

Bu starter bu klasörleri topluca vendoring yapmaz. Bunun yerine katalog ve
isteğe bağlı installer verir; çünkü üçüncü taraf veya yerel skill klasörlerini
ham kopyalamak lisans, güncellik ve secret sızıntısı riski oluşturabilir.

## Güvenlik Artifacts

Önceki kurulum şunları da kullanıyordu:

```text
~/.gitignore_global
~/.githooks/pre-commit
```

Bu starter, sanitize edilmiş karşılıkları `templates/git/` altında içerir.

## Karar

Yeni repository kullanıcı home dizininin ham kopyası değil, temiz bir dağıtım
paketi olmalıdır. Bu yüzden şunları içerir:

- genelleştirilmiş template'ler
- yedek alan installer scriptleri
- kataloglar
- dokümanlar
- validasyon

Şunları hariç tutar:

- Codex session/memory state'i
- auth dosyaları
- project trust state'i
- hook trust hash'leri
- makineye özel proje yolları
- incelenmeden kopyalanmış üçüncü taraf skill dizinleri
