# Yerel Denetim - 2026-06-10

Bu normalize edilmiş denetim, önceki global Codex çalışmasının nereye yazıldığını
açıklar.

## Masaüstü Araması

Bu repo oluşturulmadan önce Masaüstü'nde yalnızca bir eşleşen dizin bulundu:

```text
~/Desktop/codex-cli-best-practice-main
```

Mevcut `codex-chef` repo'su yoktu.

## Global Codex Siniri

Onceki workstation'da mevcut global Codex dosyalari, rol dosyalari, rule'lar,
skill'ler, MCP config'i, hook'lar ve private operasyon notlari vardi. Bu
detaylar public starter repo'ya degil, kullanicinin lokal setup'ina aittir.

Bu starter yalnizca reusable, incelenmis template ve validator'lari tasir.
Private runbook'lar, exact lokal model varsayilanlari, enabled account
connector'lari, project trust kayitlari, hook state'i, auth dosyalari,
token'lar, session'lar, memory'ler veya makineye ozel path'ler public pakete
kopyalanmamalidir.

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
