# Araştırma Notları

Araştırma şu kaynaklara dayandı:

1. Güncel yerel Codex config kanıtı.
2. 2026-06-10 tarihinde alınan resmi Codex manual.
3. Mevcut yerel global Codex güvenlik checklist'i ve uzman ajanları.

## Kullanılan Resmi Başlıklar

- CLI komut referansı ve global flag'ler.
- `AGENTS.md` keşfi ve öncelik sırası.
- Skill yapısı, çağrılması ve dağıtımı.
- MCP transport ve config modeli.
- Rules ve komut onay davranışı.
- Hooks, trust review ve desteklenen event'ler.
- Permissions ve sandbox profilleri.
- Plugin ve marketplace dağıtımı.
- Subagent'lar ve açık tetikleme tradeoff'ları.
- Windows native sandbox ve WSL rehberi.

## Temel Sonuçlar

- Kalıcı insan çalışma anlaşmaları için doğru yer `AGENTS.md`.
- Model, sandbox, onay, feature, MCP, profil ve ajan ayarları için doğru yer
  `config.toml`.
- Tekrar kullanılabilir iş akışları için doğru yapı skill.
- Skill, MCP metadata veya app entegrasyonları paketlenecekse daha güvenli
  paylaşım birimi plugin.
- MCP server'lar özellikle private hesaplara veya production veriye erişirken
  tool boundary olarak görülmeli.
- Rules dar kalmalı; tehlikeli işleri sessiz varsayılanlara çevirmemeli.
- Hooks faydalı guardrail'dir ama trust review ister ve tek güvenlik kontrolü
  olmamalıdır.
- Native Windows sandbox birinci sınıf yoldur; WSL2 Linux-native workflow'larda
  daha uygundur.
