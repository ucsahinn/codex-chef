# Skill'ler, Plugin'ler ve Uzman Ajanlar

## Skill'ler

Skill'ler tekrar kullanılabilir iş akışlarıdır. Codex bir skill'i seçene kadar
tam talimatları yüklemez; bu yüzden açıklamalar net, kısa ve tetiklenme koşulu
öne alınmış olmalıdır.

Resmi kaynak: https://developers.openai.com/codex/skills

Bu repo şunları içerir:

- `catalog/skills.json`: seçilmiş skill kurulum hedefleri ve kategorileri.
- `plugins/codex-enterprise-workflows/skills/enterprise-codex-operator`: bu
  kurulumu bakımda tutmak için küçük bir yerel skill.

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

## Uzman Ajanlar

Bu starter odaklı ajanlar kaydeder:

- `code_mapper`: büyük değişikliklerden önce read-only proje haritalama.
- `docs_researcher`: güncel doküman, API ve sürüm hassas bilgileri.
- `code_reviewer`: doğruluk, regresyon ve eksik test review geçişi.
- `frontend_verifier`: tarayıcı, screenshot, layout ve etkileşim kontrolleri.
- `security_auditor`: auth, secret, API route, veri erişimi, izin ve abuse-path
  denetimi.
- `test_verifier`: lint, typecheck, test, build ve smoke kanıtı.
- `release_verifier`: Git hijyeni, artifact, secret scan ve publish gate'leri.

Resmi kaynak: https://developers.openai.com/codex/subagents

Güvenlik notu: subagent'lar onayları, sandbox'ı veya connector auth sınırlarını
atlamaz. En iyi kullanım alanları okuma ağırlıklı keşif, log/test inceleme,
UI doğrulama, güvenlik audit'i ve release öncesi kanıt toplamadır.
