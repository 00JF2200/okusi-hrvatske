# 🇭🇷 OKUSI HRVATSKU — Vodič za deployment

## Struktura projekta

```
okusi-hrvatsku/
├── api/
│   └── claude.js          ← Vercel serverless function (čuva API ključ)
├── public/
│   ├── manifest.json      ← PWA config
│   └── icons/
│       ├── icon-192.png   ← App ikona
│       └── icon-512.png   ← App ikona (velika)
├── src/
│   ├── main.jsx           ← React entry point
│   └── App.jsx            ← Cijela aplikacija
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .env.example
└── .gitignore
```

---

## 🚀 KORAK 1 — Pripremi API ključ

1. Idi na https://console.anthropic.com
2. Klikni **API Keys** → **Create Key**
3. Kopiraj ključ (počinje s `sk-ant-...`)
4. **ČUVAJ GA KAO LOZINKU** — ne dijeli ga nikome

---

## 🚀 KORAK 2 — Postavi na GitHub

```bash
# Instaliraj Node.js s https://nodejs.org (LTS verzija)

# U terminalu:
cd okusi-hrvatsku
npm install

# Testiraj lokalno (opcionalno):
npm run dev
# → Otvori http://localhost:5173

# Inicijaliziraj Git:
git init
git add .
git commit -m "Initial commit: Okusi Hrvatsku"

# Idi na https://github.com → New repository
# Zovi ga "okusi-hrvatsku", private ili public
# Kopiraj URL repozitorija pa:

git remote add origin https://github.com/TVOJE_IME/okusi-hrvatsku.git
git push -u origin main
```

---

## 🚀 KORAK 3 — Deploy na Vercel

1. Idi na **https://vercel.com** → Sign up s GitHub računom
2. Klikni **Add New Project**
3. Odaberi tvoj `okusi-hrvatsku` repozitorij
4. Vercel automatski detektira Vite — klikni **Deploy**
5. Sačekaj 1-2 minute → dobiveš URL poput `okusi-hrvatsku.vercel.app`

### ⚠️ VAŽNO: Dodaj API ključ na Vercel

1. Idi u tvoj projekt na Vercel → **Settings** → **Environment Variables**
2. Klikni **Add New**:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-tvoj-kljuc`
   - Environment: Production, Preview, Development (sve)
3. Klikni **Save**
4. Idi na **Deployments** → **Redeploy** (da primi novi env var)

✅ **Gotovo! Aplikacija radi na internetu.**

---

## 📱 KORAK 4 — Instaliraj kao app (PWA)

### Na iPhoneu:
1. Otvori URL u **Safari**
2. Klikni **Share** (kvadrat sa strelicom)
3. Odaberi **"Dodaj na početni zaslon"**
4. Klikni **Dodaj** → ikona se pojavi kao prava app!

### Na Androidu:
1. Otvori URL u **Chrome**
2. Klikni **⋮** (tri točke) gore desno
3. Odaberi **"Dodaj na početni zaslon"** ili **"Instaliraj aplikaciju"**
4. Potvrdi → instalirana!

---

## 🍎 App Store (Apple)

### Potrebno:
- Mac računalo
- Apple Developer Account: **99$/godina** → https://developer.apple.com
- Xcode (besplatno na Mac App Store)

### Koraci:
1. Instaliraj **Capacitor**: `npm install @capacitor/core @capacitor/ios`
2. `npx cap init` → unesi naziv i Bundle ID (npr. `com.tvojime.okusihrvatsku`)
3. `npm run build && npx cap add ios`
4. `npx cap open ios` → otvori Xcode
5. U Xcode: odaberi tvoj Apple account, postavi certifikate
6. **Product → Archive** → Upload to App Store Connect
7. Na https://appstoreconnect.apple.com popuni:
   - Screenshotove (min 3 za iPhone 6.7")
   - Opis na HR/EN/DE
   - Kategorija: **Food & Drink**
   - Privacy Policy URL (koristi https://app-privacy-policy-generator.nisrulz.com/)
8. Submit for Review → čeka 1-3 radna dana

---

## 🤖 Google Play Store

### Potrebno:
- Google Play Console: **25$ jednokratno** → https://play.google.com/console
- Android Studio (besplatno)

### Koraci:
1. Instaliraj: `npm install @capacitor/android`
2. `npx cap add android`
3. `npm run build && npx cap sync`
4. `npx cap open android` → otvori Android Studio
5. **Build → Generate Signed Bundle/APK → Android App Bundle (AAB)**
6. Kreiraj keystore (čuvaj ga zauvijek!)
7. Na Play Console: **Create app** → Upload AAB
8. Popuni store listing:
   - Kratki opis (80 znakova)
   - Dugi opis (4000 znakova)  
   - Screenshotovi (min 2, preporučeno 8)
   - Feature graphic: 1024×500px
   - Kategorija: **Food & Drink**
9. Postavi Content Rating, Privacy Policy
10. Submit → review 2-7 dana

---

## 💰 Troškovi

| Stavka | Cijena |
|--------|--------|
| Vercel hosting | **Besplatno** (do 100GB bandwidth/mj) |
| Anthropic API | ~0.003$ po generiranju 25 restorana |
| Apple Developer | 99$/godina |
| Google Play | 25$ jednokratno |
| Domena (opcionalno) | ~10$/godina |

---

## 🔧 Korisni linkovi

- Vercel: https://vercel.com
- Anthropic Console: https://console.anthropic.com
- Capacitor docs: https://capacitorjs.com/docs
- App Store Connect: https://appstoreconnect.apple.com
- Google Play Console: https://play.google.com/console
- Privacy Policy generator: https://app-privacy-policy-generator.nisrulz.com/

---

## ❓ Česta pitanja

**Q: Zašto se restorani generiraju svaki put iznova?**  
A: Za produkciju, dodaj bazu podataka (Vercel KV ili Supabase) da se restorani cachiraju jednom generirani.

**Q: Mogu li dodati pravu Google Maps integraciju?**  
A: Da — registriraj se na Google Cloud Console, uzmi Maps API ključ, dodaj ga kao env var.

**Q: Kako dodati nove gradove?**  
A: U `App.jsx` dodaj novi objekt u `CITIES` array s `id`, `name`, `flag`, `target`.

**Q: Mogu li naplaćivati app?**  
A: Da. Na App Store/Google Play postavi cijenu ili freemium model (besplatno + premium gradovi).
