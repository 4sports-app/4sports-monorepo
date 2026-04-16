# vukasinIZMENE — Ažuriran plan

---

## ✅ ZAVRŠENO

| # | Stavka | Status |
|---|--------|--------|
| 1 | RecordPaymentDialog pre-fill iznosa članarine | ✅ |
| 2 | Bold iznosi u balance pie chartu (BalanceDonutCard) | ✅ |
| 3 | Svi datumi → dd/MM/yyyy (dateUtils.ts helper) | ✅ |
| 4 | Chat → klik na ime → profil člana | ✅ |
| 5 | Dugmići na profilu člana (uplata + medicinski badge klikabilan) | ✅ |
| 6 | Upload slike vlasnika (SettingsPage) | ✅ |
| 7 | Upload grb kluba (ClubProfilePage → /upload/post-images) | ✅ |
| 8 | Lokacija obavezna za event + LocationAutocomplete (Nominatim) | ✅ |
| 9 | Tip događaja sa bojom (color picker, 12 boja, localStorage) | ✅ |
| 10 | Grupiranje po treneru + toggle u pie chartu (dashboard) | ✅ |
| 11 | Kad je plaćeno → dugme postaje outline "Ažuriraj" | ✅ |
| 12 | Error handling (AuthContext, API interceptor, QueryClient) | ✅ |
| 13 | Svi debug console.log uklonjeni (web-admin) | ✅ |
| 14 | Upload bug fix (Content-Type boundary, Mongoose validacija) | ✅ |

---

## 🔲 WEB ADMIN — preostalo

### 1. Onboarding popup (club setup)

| Fajl | Izmena |
|------|--------|
| `web-admin/src/components/shared/ClubOnboardingDialog.tsx` | **NOV FAJL** — stepper modal (2 koraka) |
| `web-admin/src/App.tsx` | Renderovati `<ClubOnboardingDialog>` ako klub nema `clubName` ili `sport` |
| `web-admin/src/features/auth/AuthContext.tsx` | Posle login-a proveriti `clubData.sport` → state `showOnboarding` |
| `backend/src/models/Club.ts` | Dodati `sport: String`, `currency: String` |
| `backend/src/controllers/settingsController.ts` | Primati `sport` i `currency` u `PUT /settings/club` |

**Korak 1 (obavezno):** ime kluba, sport (select sa ikonama), upload grb, telefon, lokacija, valuta
**Korak 2 (opciono, preskoči):** istorijat, trofeji, web sajt, Instagram, Facebook

**Sportovi:**
Timski: Fudbal ⚽, Košarka 🏀, Odbojka 🏐, Rukomet 🤾, Ragbi 🏉, Hokej 🏒, Vaterpolo 🤽, Američki fudbal 🏈
Individualni: Tenis 🎾, Atletika 🏃, Plivanje 🏊, Džudo 🥋, Karate 🥋, Gimnastika 🤸, Boks 🥊, Biciklizam 🚴, Ski ⛷️
\+ Custom input (ostalo)

---

### 2. Biranje valute globalno (na onboarding-u)

| Fajl | Izmena |
|------|--------|
| `backend/src/models/Club.ts` | `currency: { type: String, default: 'RSD' }` |
| `web-admin/src/context/CurrencyContext.tsx` | **NOV FAJL** — globalni context za valutu |
| Svi fajlovi gde piše `RSD` hardkodirano | Zameniti sa `currency` iz konteksta |
| Onboarding dialog | Select za valutu (RSD, EUR, USD, GBP, CHF, BAM, HRK, TRY, SAR, AED) |

---

### 3. Stavljanje info i slike kluba u profilu kluba

| Fajl | Izmena |
|------|--------|
| `web-admin/src/features/club-profile/ClubProfilePage.tsx` | Upload logo radi (fixovano), proveriti prikaz svih polja |
| `backend/src/controllers/settingsController.ts` | Sačuvati sva polja (foundedYear, stadium, achievements, social linkovi) |

---

### 4. Rashodi/Troškovi — ukloniti iz UI

| Fajl | Izmena |
|------|--------|
| `web-admin/src/features/finances/FinancePage.tsx` | Sakriti EXPENSE tab/filter |
| `web-admin/src/features/finances/AddTransactionDialog.tsx` | Ukloniti mogućnost biranja EXPENSE tipa |
| Dashboard KPI kartice | Ukloniti "Rashodi" karticu ili sakriti |

---

### 5. Globalni search (pretraga svega)

| Fajl | Izmena |
|------|--------|
| `web-admin/src/components/shared/GlobalSearch.tsx` | **NOV FAJL** — search bar u header-u |
| `web-admin/src/components/layout/Sidebar.tsx` ili `Header.tsx` | Ubaciti `<GlobalSearch>` |
| `backend/src/controllers/searchController.ts` | **NOV FAJL** — `GET /search?q=...` pretražuje članove, grupe, transakcije, preglede |
| `backend/src/routes/searchRoutes.ts` | Nova ruta |

Treba da bude dovoljno da ukucaš ime/termin i izađu svi rezultati (članovi, grupe, pregledi, transakcije).

---

### 6. Dodati još jezika + srediti hardkodirane stringove

| Fajl | Izmena |
|------|--------|
| `web-admin/src/locales/de.ts` | **NOV FAJL** — nemački prevod |
| `web-admin/src/locales/fr.ts` | **NOV FAJL** — francuski prevod |
| `web-admin/src/locales/it.ts` | **NOV FAJL** — italijanski prevod |
| `web-admin/src/locales/ar.ts` | **NOV FAJL** — arapski prevod (RTL support?) |
| `web-admin/src/i18n.ts` | Registrovati nove jezike |
| Svi fajlovi sa hardkodiranim sr/en stringovima | Zameniti sa `t('...')` ključevima |

**Hardkodirani stringovi za pronaći:** "Plaćeno", "Nije plaćeno", "Validni pregledi", "Ističe uskoro", "Bez grupe", "plaćeno", "validnih" itd.

---

### 7. Guide/Tutorial za sve ekrane

| Fajl | Izmena |
|------|--------|
| `web-admin/src/context/OnboardingContext.tsx` | Dodati `PAGE_TUTORIALS` za: `calendar`, `chat`, `club-profile`, `finances`, `evidence` |
| Svi page fajlovi | Dodati `data-tour="..."` atribute na ključne elemente |

---

### 8. Terms & Conditions

| Fajl | Izmena |
|------|--------|
| `web-admin/src/features/auth/RegisterPage.tsx` | Checkbox "Prihvatam uslove korišćenja" pre registracije |
| `web-admin/src/pages/TermsPage.tsx` | **NOV FAJL** — statična stranica sa uslovima |
| `web-admin/src/pages/PrivacyPage.tsx` | **NOV FAJL** — politika privatnosti |
| Router | Dodati `/terms` i `/privacy` rute |

---

### 9. Jezik i region na osnovu lokacije

| Fajl | Izmena |
|------|--------|
| `web-admin/src/i18n.ts` | Auto-detekcija jezika iz `navigator.language` |
| `web-admin/src/features/settings/SettingsPage.tsx` | Dropdown za ručni izbor jezika |

---

### 10. Staviti CORS

| Fajl | Izmena |
|------|--------|
| `backend/src/app.ts` ili `server.ts` | Proveriti/dodati `cors()` middleware sa whitelistom domena |

---

### 11. Prvi mesec besplatno (trial)

| Fajl | Izmena |
|------|--------|
| `backend/src/models/Club.ts` | `trialEndsAt: { type: Date, default: now + 30 dana }` |
| `backend/src/controllers/settingsController.ts` | `GET /settings/subscription` → `{ isInTrial, trialEndsAt, daysLeft }` |
| `web-admin/src/features/settings/SettingsPage.tsx` | Banner "Ostalo X dana besplatnog perioda" |

---

## Redosled implementacije

```
PRIORITET 1 — core funkcionalnost
1.                     → 6h
                     → 1h
3.                    → 1h
4.  CORS backend                                 → 30 min

PRIORITET 2 — korisničko iskustvo
5.              → 3h
6.               → 4h
7.           → 1h
8.  Globalni search  xxx                            → 4h
9.  Terms & conditions     x                      → 2h

PRIORITET 3 — polish
10. Guide/tutorial za sve ekrane x                → 3h
11. Trial (prvi mesec besplatno)                 → 2h
```
