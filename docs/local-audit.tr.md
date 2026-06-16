# Yerel Denetim - 2026-06-10

Bu normalize edilmis denetim, onceki global Codex calismasinin hangi sinirlarda
kaldigini aciklar.

## Masaustu Aramasi

Bu repo olusturulmadan once workstation uzerinde onceki bir yerel Codex setup
dizini bulundu. Exact makineye ozel path public pakete bilerek yazilmaz.

Mevcut bir `codex-chef` reposu yoktu.

## Global Codex Siniri

Onceki workstation'da mevcut global Codex dosyalari, rol dosyalari, rule'lar,
skill'ler, MCP config'i, hook'lar ve private operasyon notlari vardi. Bu
detaylar public starter repo'ya degil, kullanicinin lokal setup'ina aittir.

Bu starter yalnizca reusable, incelenmis template ve validator'lari tasir.
Private runbook'lar, exact lokal model varsayilanlari, enabled account
connector'lari, project trust kayitlari, hook state'i, auth dosyalari,
token'lar, session'lar, memory'ler veya makineye ozel path'ler public pakete
kopyalanmamalidir.

## Guncel Skill Konumlari

Skill'ler iki yerde bulundu:

```text
~/.codex/skills
~/.agents/skills
```

Bu starter bu klasorleri topluca vendor etmez. Bunun yerine katalog ve istege
bagli installer verir; cunku ucuncu taraf veya yerel skill klasorlerini ham
kopyalamak lisans, guncellik ve secret sizintisi riski olusturabilir.

## Guvenlik Artifact'leri

Onceki kurulum sunlari da kullaniyordu:

```text
~/.gitignore_global
~/.githooks/pre-commit
```

Bu starter, sanitize edilmis karsiliklari `templates/git/` altinda icerir.

## Karar

Yeni repository kullanici home dizininin ham kopyasi degil, temiz bir dagitim
paketi olmalidir. Bu yuzden sunlari icerir:

- genellestirilmis template'ler
- yedek alan installer scriptleri
- kataloglar
- dokumanlar
- validasyon

Sunlari haric tutar:

- Codex session/memory state'i
- auth dosyalari
- project trust state'i
- hook trust hash'leri
- makineye ozel proje yollari
- incelenmeden kopyalanmis ucuncu taraf skill dizinleri
