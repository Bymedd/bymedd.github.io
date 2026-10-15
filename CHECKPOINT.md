# CHECKPOINT - gezi-platform
Son guncelleme: 2026-10-14 17:55:00
Asama: TAMAM - 3 sehir compact akis bitti (7/7)
Gorev: Afyonkarahisar + Ankara + Ardahan compact akis

## TAMAM (7/7)
- tarama, video (40/40 noembed), yer kartlari arastirmasi
- gorsel 87/87 indi: Afyon 15 + Ankara 57 + Ardahan 15; HTML'de referanslanan tum gorseller yerinde (eksik 0)
- CREDITS 3/3: afyonkarahisar 16, ankara 58, ardahan 16 isaret; supheli "??" : 0
- yama 3/3; 8 lezzet kartina data-search eklendi (arama crash fixi)
- Afyonkarahisar.html: 37 article = 25 yer + 12 vcard; stats 25/5/3/3/2/2/3/3/4/12 birebir
  Yeni kartlar: İmaret Camii (tarihi) + Zafer Muzesi (muze)
- Ankara.html: 82 = 70 yer + 12 vcard; stats 70/12/10/12/10/7/12/7/12 birebir
  Yeni kartlar: Taceddin Dergahi (tarihi) + Resim ve Heykel Muzesi (muze)
- Ardahan.html: 35 = 25 yer + 10 vcard; stats 25/5/2/5/2/2/2/3/4/10 birebir
  Yeni kartlar: Yurtbekler Tas Koprusu (tarihi, gorselsiz) + Damal Ataturk Silueti (park)

## TARAYICI TESTI (3 sehir TAM)
- Sunucu: _tmp_server.mjs (thread calisma alani) 127.0.0.1:8137'de detach; PID 2696
  - Onemli duzeltme: .css MIME 'text/javascript' -> 'text/css' yapildi (tarayici CSS'i reddediyordu; box-sizing border-box artik aktif, mobil tasma kalmadi)
- Ankara: 82 kart, 12 vthumb, arama+filtre bazlarla birebir, border-box aktif, tasma/ kirik gorsel 0
- Ardahan: 35 kart, 10 vthumb; 10/10 tiklayinca-oynat atributu TAM
  (srcMatch, autoplay=1, youtube-nocookie, title, allow*=autoplay, allowFullscreen, 16:9 ratio 1.78)
  arama bazla birebir (cildir=15 posof=4 yurtbekler=1 damal=2 gravyer=1 olmayanxyz=0)
  filtre birebir (videolar=10 tarihi=5 muze=2 park=5 piknik=2 kamp=2 su=2 ilce=3 lezzet=4)
  bos-durum mesaji calisiyor; konsol temiz (yalniz web-share izin uyarisi); mobil tek sutun tasma yok
- Afyon: 37 kart, 12 vthumb, arama+filtre bazlarla birebir, border-box aktif, tasma/ kirik gorsel 0

## TEMIZLIK
- Gecici betikler silindi: _serve.js _verify.mjs _commons.mjs _dl.mjs _cp.mjs
  _patch_ankara.mjs _patch_city.mjs _find_nods.mjs _fix_ds.mjs _credits.mjs _credits_ek.mjs
  _baselines.mjs _meta_*.json -> "ls _*" TEMIZ

## NOTLAR
- Commons hiz limiti: basarisiz istekler de sayiyor; basari icin ~65sn tekil istek
- run.md guncel: _tmp_server.mjs (statik, sabit kok, 8137, detach tarifi)

## EK IS - Ankara koyu tema + turkey.html iframe gecisi (2026-10-14 13:05)
- Ankara.html: </head> oncesine ege-guide-layout.css + city-guides-dark.css linklendi
  (inline acik temanin UZERINE biniyor; koyu tema aktif: body #090d16, kart #111827, hero koyu gradyan)
  Dogrulama: 82 kart, arama bazla birebir (anitkabir=4 beypazari=2 taceddin=2 gordion=2 baraj=18 xyz=0),
  filtreler birebir (videolar=12 tarihi=12 muze=10 park=12 piknik=10 kamp=7 su=12 ilce=7),
  bos-durum calisiyor, tasma yok, konsol temiz
- turkey.html: 24KB inline Ankara mini-rehber div silindi, yerine diger sehirler gibi
  section id=ankaraGuideSection class=city-guide-wrapper + iframe src=./Ankara.html kondu
  Haritada Ankara tiklaninca altta tam Ankara.html aciliyor; hash #/sehir/ankara calisiyor
- city-video-slots.js: ankaraGuide fallback kaldirildi (artik iframe var; eski govde enjeksiyonu gerekmiyor)
  Regresyon: Balikesir.html showcase 9 slot sorunsuz (hero sayfalari etkilenmedi)
- Temizlik: _patch_dark_ankara.mjs silindi

## EK IS - turkey.html Sohbet ozelligi (2026-10-14 17:55)
- Yeni: chat.css, chat.js, vendor/supabase.min.js (supabase-js v2.117.3), supabase/chat_setup.sql, SOHBET_KURULUM.md
- turkey.html: region pill'lerin yanina "<"< "<> Sohbet<>" butonu (region-pill SINIFI VERILMEDI; app.js region filtresine karismiyor),
  panel markup'i + chat.css/chat.js baglantilari eklendi; diger dosyalar DEGISTIRILMEDI
- Ozellik: sag panel (ac/kapa: buton/ESC/X/overlay), Supabase Auth Google (PKCE, gercek OAuth -
  provider kapalisa panelde aciklayici Turkce uyari, SAHTE giris ekrani yok), chat_messages
  tablosuna mesaj gonderimi, realtime abonelik + 5sn poll yedegi, XSS icin textContent render
- Test (127.0.0.1:8231, _tmp_server.mjs, PID 3484): buton konumu, panel ac/kapa tum yollari,
  giris ekrani masaustu+mobil (390px tam ekran), region filtresi regresyon (Ege=aktif, Ankara dim),
  Google butonu -> "provider kapali" uyarisi (gerçek /auth/v1/settings cevabi), ?error= param temizligi,
  girisli oda render+gonderim stub ile dogrulandi (konsol temiz)
- YAPILMASI GEREKEN (kullanici): 1) supabase/chat_setup.sql calistir 2) Supabase'de Google
  provider + OAuth client 3) Redirect URL listesi. Ayrinti: SOHBET_KURULUM.md
- Not: bir onceski statik sunucu (PID 2696, 8137) eski/cached kopya servis ediyor; yeni testler 8231'de
