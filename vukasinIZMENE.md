# vukasinIZMENE — Šta, Gde, Kako

---

## 1. Grupiranje po treneru + toggle na pie chartu

| Fajl | Izmena |
|------|--------|
| `web-admin/src/features/finances/groupingUtils.ts` | Dodati funkciju `groupTransactionsByCoach()` |
| `web-admin/src/features/finances/TransactionGroupingControls.tsx` | Dodati opciju `value="coach"` u Select |
| `web-admin/src/features/finances/FinancePage.tsx` | Dodati `case 'coach':` koji zove novu funkciju |
| `web-admin/src/features/dashboard/GroupBreakdownChart.tsx` | Dodati toggle dugme Grupe/Treneri, pie chart menja podatke |
| `web-admin/src/locales/sr.ts` + `en.ts` | `groupByCoach`, `coachBreakdown` ključevi |

---

## 2. Onboarding popup (club setup)

| Fajl | Izmena |
|------|--------|
| `web-admin/src/components/shared/ClubOnboardingDialog.tsx` | **NOV FAJL** — modal sa 2 koraka |
| `web-admin/src/App.tsx` | Renderovati `<ClubOnboardingDialog>` ako klub nema `name` ili `sport` |
| `web-admin/src/features/auth/AuthContext.tsx` | Posle `fetchBackendUser()` proveriti `clubData.sport` — eksponovati `showOnboarding` state |
| `backend/src/models/Club.ts` | Dodati `sport: { type: String }` |
| `backend/src/controllers/settingsController.ts` | Primati i čuvati `sport` u `PUT /settings/club` |

**Korak 1 (obavezno):** naziv kluba, sport (select sa ikonama — lista ispod), logo upload, telefon, adresa
**Korak 2 (preskoči):** istorijat, trofeje, web sajt, Instagram, Facebook

**Sportovi:**
Timski: Fudbal ⚽, Košarka 🏀, Odbojka 🏐, Rukomet 🤾, Ragbi 🏉, Hokej 🏒, Vaterpolo 🏊, Američki fudbal 🏈
Individualni: Tenis 🎾, Atletika 🏃, Plivanje 🏊, Džudo 🥋, Karate 🥋, Gimnastika 🤸, Boks 🥊, Biciklizam 🚴, Ski ⛷️
\+ Custom input (ostalo)

---

## 3. Dugmići na profilu člana (uplata + medicinski)

| Fajl | Izmena |
|------|--------|
| `web-admin/src/features/profile/ProfilePage.tsx` | Dodati 2 dugmeta + stanja `recordPaymentOpen`, `recordMedicalOpen` |
| — | Renderovati `<RecordPaymentDialog>` i `<RecordMedicalDialog>` direktno sa profila |

---

## 4. Chat → klik na učesnika → profil člana

| Fajl | Izmena |
|------|--------|
| `web-admin/src/features/chat/ChatPage.tsx` | Učesnike u headeru omotati sa `<Link to="/profile?userId=...">` |

---

## 5. Bold iznosi u balance pie chartu

| Fajl | Izmena |
|------|--------|
| `web-admin/src/features/dashboard/BalanceDonutCard.tsx` | Na iznosima u legendi dodati `font-bold text-base` |

---

## 6. Prvi mesec besplatno (trial)

| Fajl | Izmena |
|------|--------|
| `backend/src/models/Club.ts` | Dodati `trialEndsAt: { type: Date, default: now + 30 dana }` |
| `backend/src/controllers/settingsController.ts` | `GET /settings/subscription` vraća `isInTrial: bool, trialEndsAt: Date` |
| `web-admin/src/features/settings/SettingsPage.tsx` | Prikazati banner "Ostalo X dana besplatnog perioda" |

---

## 7. Lokacija — obavezno + mapa

| Fajl | Izmena |
|------|--------|
| `web-admin/src/features/calendar/CreateEventDialog.tsx` | Promeniti label u obavezno, dodati validaciju u `validateForm()` |
| `backend/src/models/Event.ts` | `location: { required: true }` |
| `web-admin/src/features/calendar/CreateEventDialog.tsx` | Zameniti text input sa Google Maps Autocomplete inputom (Places API) |
| `web-admin/src/features/calendar/CalendarPage.tsx` (event detalji) | Prikazati Google Map embed sa pin-om |

> ⚠️ Treba Google Maps API ključ → dodati u `web-admin/.env` kao `VITE_GOOGLE_MAPS_API_KEY`

---

## 8. Rashodi — ukloniti iz UI

> **Pojašnjenje:** U finansijama postoje 2 tipa transakcija — INCOME (prihod) i EXPENSE (rashod). U lokalizaciji se zove "Rashod/Rashodi". Hoćeš da se to ukloni? Tj. da u sistemu budu samo prihodi (uplate članarina) bez kategorije rashoda?

> **Ostavljam ovu tačku dok ne potvrdite šta tačno treba.**

---

## 9. Upload slike profila vlasnika + grb kluba

**Backend endpoint već postoji:** `POST /api/upload/profile-picture` (`uploadController.ts:16`)

| Fajl | Izmena |
|------|--------|
| `web-admin/src/features/profile/ProfilePage.tsx` | Avatar klikabilan → `<input type="file" hidden>` → POST `/upload/profile-picture` |
| `web-admin/src/features/club-profile/ClubProfilePage.tsx` | Logo upload već postoji — proveriti da li radi |

---

## 10. Svi datumi → dd/MM/yyyy

| Fajl | Izmena |
|------|--------|
| `web-admin/src/lib/dateUtils.ts` | **NOV FAJL** — `formatDate(d)` → `'dd/MM/yyyy'`, `formatDateTime(d)` → `'dd/MM/yyyy HH:mm'` |
| `web-admin/src/features/profile/ProfilePage.tsx:426` | `toLocaleDateString(...)` → `formatDate(...)` |
| `web-admin/src/features/evidence/EvidencePage.tsx:630` | Isto |
| `web-admin/src/features/finances/ViewTransactionDialog.tsx:57` | Isto |
| `web-admin/src/features/finances/TransactionsFlatTable.tsx` | `format(date, 'MMM d, yyyy')` → `formatDate(...)` |
| `web-admin/src/features/chat/ChatPage.tsx` | Svi datumi u porukama |

---

## 11. Guide/Tutorial — nastavak

| Fajl | Izmena |
|------|--------|
| `web-admin/src/context/OnboardingContext.tsx` | Dodati `PAGE_TUTORIALS` za: `calendar`, `chat`, `club-profile` |
| `web-admin/src/features/calendar/CalendarPage.tsx` | Dodati `data-tutorial="..."` atribute na dugmad |
| `web-admin/src/features/chat/ChatPage.tsx` | Isto |

---

## 12. Pre-popuniti iznos članarine pri evidentiranju uplate

| Fajl | Izmena |
|------|--------|
| `web-admin/src/features/evidence/RecordPaymentDialog.tsx:33` | `useState(membershipFee ?? DEFAULT_MEMBERSHIP_FEE)` za amount input |

---

## 13. Novi tip događaja — izbor boje

| Fajl | Izmena |
|------|--------|
| `web-admin/src/features/calendar/CreateEventDialog.tsx:77` | `EventType` interface dobija `color: string` |
| `web-admin/src/features/calendar/CreateEventDialog.tsx` | Dialog za novi tip: dodati color picker (12 preset boja, krug-dugmad) |
| `web-admin/src/features/calendar/CalendarPage.tsx` | Event chip boja = `event.color` ili boja tipa |
| `backend/src/models/Event.ts` | Dodati `color: { type: String, default: '#22c55e' }` |

---

## 14. Kad je već plaćeno — pomeriti/sakriti dugme

| Fajl | Izmena |
|------|--------|
| `web-admin/src/features/evidence/EvidencePage.tsx` | Ako `member.hasPaid` → dugme postaje sekundarno (outline, tekst "Ažuriraj") |

---

## Redosled implementacije

```
1.  RecordPaymentDialog pre-fill iznosa          → 20 min
2.  Bold iznosi u pie chartu                     → 10 min
3.  Datumi dd/MM/yyyy (dateUtils.ts)             → 1.5h
4.  Chat → profil člana (Link)                  → 30 min
5.  Dugmići na profilu člana                     → 1h
6.  Upload slike vlasnika (endpoint postoji)     → 1h
7.  Lokacija obavezna za event                   → 1h
8.  Tip događaja sa bojom                        → 3h
9.  Grupiranje po treneru + toggle               → 3h
10. Kad je platio → pomeriti dugme              → 45 min
11. Prvi mesec besplatno                         → 2h
12. Google Maps za lokaciju                      → 3h (treba API ključ)
13. Onboarding popup                             → 5h
14. Guide nastavak                               → 3h
15. Rashodi — čekamo odluku
```
