# Sahara Backend — API Documentation

## Base URL
```
http://localhost:4000
```
> Production mein replace karna apne domain se

---

## Authentication
Saare protected routes (🔒) mein yeh header bhejna zaroori hai:
```
Authorization: Bearer <accessToken>
```
Access token **15 minutes** mein expire hota hai. Expire hone par `/api/auth/refresh` use karo.

---

## 1. Auth Routes

### POST `/api/auth/register`
Naya parent account banana.
```json
// Request Body
{
  "email": "parent@example.com",
  "password": "yourpassword"
}

// Response 201
{
  "message": "Parent registered successfully",
  "data": {
    "parent": { "id": 1, "email": "parent@example.com" }
  }
}
```
> ⚠️ Rate limit: 5 registrations per hour per IP

---

### POST `/api/auth/login`
Login karo, tokens lo.
```json
// Request Body
{
  "email": "parent@example.com",
  "password": "yourpassword"
}

// Response 200
{
  "message": "Login successful",
  "data": {
    "parent": { "id": 1, "email": "parent@example.com" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```
> ⚠️ Rate limit: 10 attempts per 15 minutes per IP

---

### POST `/api/auth/refresh`
New access token lo jab expire ho jaye.
```json
// Request Body
{
  "refreshToken": "eyJ..."
}

// Response 200
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```
> Refresh token bhi rotate hota hai — naya save karo har baar

---

### GET `/api/auth/me` 🔒
Logged-in parent ki info.
```json
// Response 200
{
  "data": {
    "parent": { "id": 1, "email": "parent@example.com" }
  }
}
```

---

### POST `/api/auth/logout` 🔒
Logout karo.
```json
// Request Body
{
  "refreshToken": "eyJ..."
}

// Response 200
{ "message": "Logged out successfully" }
```

---

## 2. Parent Profile

### GET `/api/parent/profile` 🔒
```json
// Response 200
{
  "data": {
    "parent": { "id": 1, "email": "parent@example.com" }
  }
}
```

---

## 3. Child Management

### POST `/api/child/register` 🔒
Bacche ka profile banana.
```json
// Request Body
{
  "name": "Riya",
  "dob": "2018-05-10",
  "gender": "female",
  "relationWithParent": "daughter",

  // Optional:
  "knownDiagnosis": "ASD",
  "diagnosisStage": "early",
  "developmentalStage": "preschool",
  "dominantHand": "right"
}

// Response 201
{
  "data": {
    "child": { "id": 1, "name": "Riya", "dob": "2018-05-10", "age": 6 }
  }
}
```

---

### GET `/api/child` 🔒
Saare bacche list karo.
```json
// Response 200
{
  "data": {
    "children": [
      {
        "id": 1,
        "name": "Riya",
        "dob": "2018-05-10",
        "age": 6,
        "gender": "female",
        "relationWithParent": "daughter"
      }
    ]
  }
}
```

---

### GET `/api/child/:childId` 🔒
Ek bacche ka full profile.
```json
// Response 200
{
  "data": {
    "child": {
      "id": 1,
      "name": "Riya",
      "dob": "2018-05-10",
      "age": 6,
      "gender": "female",
      "relationWithParent": "daughter",
      "knownDiagnosis": "ASD",
      "diagnosisStage": "early",
      "developmentalStage": "preschool",
      "dominantHand": "right",
      "parentId": 1,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### PATCH `/api/child/:childId` 🔒
Child profile update karo (sirf jo fields bhejo wahi update hongi).
```json
// Request Body (sab optional)
{
  "name": "Riya Updated",
  "dob": "2018-05-10",
  "gender": "female",
  "knownDiagnosis": "ASD"
}

// Response 200
{ "data": { "child": { ...updated fields... } } }
```

---

## 4. Assessment Form

### GET `/api/form` 🔒
Saare questions fetch karo — ek baar load karo aur cache kar lo.
```json
// Response 200
{
  "message": "Form fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Social Interaction",
      "questions": [
        { "id": 1, "text": "Makes eye contact?", "weight": 3, "order": 1 },
        { "id": 2, "text": "Enjoys playing with other children?", "weight": 3, "order": 2 }
      ]
    }
    // ... 35 categories, 48 questions total
  ]
}
```

---

### POST `/api/form/submit` 🔒
Form submit karo answers ke saath.
```json
// Request Body
{
  "childId": 1,
  "responses": [
    { "questionId": 1, "answer": 2 },
    { "questionId": 2, "answer": 3 },
    { "questionId": 3, "answer": 1 }
    // answer scale: 0 to 4
  ]
}

// Response 200
{
  "data": {
    "formId": 5,
    "message": "Assessment submitted successfully"
  }
}
```

---

### GET `/api/child/:childId/assessment/latest` 🔒
Child ka latest assessment result.
```json
// Response 200
{
  "data": {
    "formId": 5,
    "submittedAt": "2024-01-15T10:30:00Z",
    "categories": [
      {
        "category": { "id": 1, "name": "Social Interaction" },
        "totalScore": 12,
        "maxPossibleScore": 15,
        "normalizedScore": 80,
        "severity": "High"
      }
    ]
  }
}
```
> Severity: `"High"` ≥ 80 | `"Medium"` ≥ 50 | `"Low"` < 50

---

## 5. Activities (Recommendations)

### GET `/api/activity/:childId` 🔒
Child ke liye recommended activities — assessment submit hone ke baad kaam karta hai.
```json
// Response 200
{
  "data": [
    {
      "id": 1,
      "title": "Finger Painting",
      "description": "Creative activity for fine motor skills",
      "category": "Motor Skills",
      "tags": ["fine-motor", "creative"],
      "score": 0.95
    }
  ]
}
```

---

## 6. Daily Routine

### PUT `/api/routine/:childId` 🔒
Poora weekly routine set karo — pehle wala replace ho jaayega.
```json
// Request Body
{
  "name": "Riya's Daily Plan",
  "timezone": "Asia/Kolkata",
  "week": {
    "MON": [
      { "startMinute": 540, "endMinute": 570, "title": "Morning Stretch", "order": 1 }
    ],
    "TUE": [...],
    "WED": [],
    "THU": [...],
    "FRI": [...],
    "SAT": [...],
    "SUN": []
  }
}
```
> `startMinute` / `endMinute` = minutes since midnight. Example: 540 = 9:00 AM, 600 = 10:00 AM

```json
// Response 200
{
  "data": {
    "routine": { "id": 1, "name": "Riya's Daily Plan", "week": { ... } }
  }
}
```

---

### GET `/api/routine/:childId` 🔒
Poora weekly routine fetch karo.
```json
// Response 200
{
  "data": {
    "routine": {
      "id": 1,
      "name": "Riya's Daily Plan",
      "week": {
        "MON": [{ "id": 10, "title": "Morning Stretch", "startMinute": 540, "endMinute": 570, "order": 1 }],
        "TUE": [...],
        "WED": [],
        ...
      }
    }
  }
}
```

---

### GET `/api/routine/:childId/day?date=YYYY-MM-DD` 🔒
Ek specific din ke items.
```
GET /api/routine/1/day?date=2024-01-15
```
```json
// Response 200
{
  "data": {
    "date": "2024-01-15",
    "dayOfWeek": "MON",
    "items": [
      { "id": 10, "title": "Morning Stretch", "startMinute": 540, "endMinute": 570 }
    ]
  }
}
```

---

### GET `/api/routine/:childId/progress` 🔒
7-day completion stats.
```json
// Response 200
{
  "data": {
    "completionRate": 0.75,
    "totalItems": 20,
    "completedItems": 15,
    "dailyBreakdown": [...]
  }
}
```

---

### POST `/api/routine/:childId/items` 🔒
Ek naya item add karo.
```json
// Request Body
{
  "dayOfWeek": "MON",
  "startMinute": 700,
  "endMinute": 730,
  "title": "Breathing Exercise",
  "order": 2
}

// Response 201
{ "data": { "item": { "id": 15, "title": "Breathing Exercise", ... } } }
```

---

### PATCH `/api/routine/:childId/items/:itemId` 🔒
Item update karo (partial update).
```json
// Request Body
{ "title": "Deep Breathing", "startMinute": 710 }

// Response 200
{ "data": { "item": { ...updated... } } }
```

---

### DELETE `/api/routine/:childId/items/:itemId` 🔒
Item delete karo.
```json
// Response 200
{ "message": "Item deleted" }
```

---

## 7. Community Forum

### POST `/api/posts/create` 🔒
Naya post banana.
```json
// Request Body
{
  "title": "Fine motor tips for 7-year-olds",
  "content": "What activities have helped your child?"
}

// Response 201
{ "data": { "post": { "id": 1, "title": "...", "content": "...", "createdAt": "..." } } }
```

---

### GET `/api/posts` 🔒
Saare posts list.
```json
// Response 200
{ "data": { "posts": [...] } }
```

---

### GET `/api/posts/:postId` 🔒
Single post fetch karo.
```json
// Response 200
{ "data": { "post": { "id": 1, "title": "...", "content": "...", "comments": [...] } } }
```

---

### POST `/api/posts/:postId/comment` 🔒
Comment add karo.
```json
// Request Body
{ "content": "This worked brilliantly for us!" }

// Response 200/201
{ "data": { "comment": { "id": 5, "content": "...", "createdAt": "..." } } }
```

---

### GET `/api/posts/:postId/comment` 🔒
Post ke saare comments fetch karo.
```json
// Response 200
{ "data": { "comments": [...] } }
```

---

## 8. AAC Keyboard

### GET `/api/acc` 🔒
Saari categories aur quick-access symbols.
```json
// Response 200
{
  "data": {
    "categories": [
      { "id": 79, "name": "Emotions", "color": "#FF6B6B" }
    ],
    "quickSymbols": [
      { "id": 1, "title": "Yes", "imageUrl": "...", "categoryId": 79 },
      { "id": 2, "title": "No",  "imageUrl": "...", "categoryId": 79 }
    ]
  }
}
```

---

### GET `/api/acc/:categoryId/symbols` 🔒
Ek category ke saare symbols.
```json
// Response 200
{
  "data": [
    { "id": 5, "title": "Happy", "imageUrl": "...", "categoryId": 79 }
  ]
}
```

---

## 9. AI Features 🤖

> Yeh saare features GPT-4o-mini use karte hain. Internet nahi ya API key nahi toh rule-based fallback automatically activate hota hai.

---

### GET `/api/ai/routine/:childId/adaptive` 🔒
**P1 — Adaptive Daily Routine Engine**

Child ke assessment + 7-day history dekh ke aaj ka personalized plan banata hai.

```
GET /api/ai/routine/1/adaptive
GET /api/ai/routine/1/adaptive?lowEnergy=true
GET /api/ai/routine/1/adaptive?timezone=Asia/Kolkata
```

```json
// Response 200
{
  "data": {
    "plan": {
      "childName": "Riya",
      "date": "2024-01-15",
      "profile": "adaptive",
      "focusArea": "Motor Skills",
      "secondaryFocus": "Communication",
      "items": [
        { "title": "Finger Painting", "duration": 30, "reason": "Motor skill focus" }
      ],
      "explanation": "Riya has been improving steadily. We added a secondary focus on communication today.",
      "date": "2024-01-15"
    }
  }
}
```

| Profile | Kab milta hai |
|---|---|
| `adaptive` | Assessment data available hai |
| `calming` | Weekend ya `?lowEnergy=true` |
| `default` | Koi assessment nahi abhi tak |

---

### GET `/api/ai/routine/:childId/items/:itemId/why` 🔒
**P1b — Why This Routine Item**

Ek routine item ka GPT-generated 1-sentence explanation.
```json
// Response 200
{
  "data": {
    "explanation": "We chose morning stretch for Riya to build motor coordination in a gentle, fun way."
  }
}
```

---

### POST `/api/ai/chat/:childId` 🔒
**P2 — AI Parent Coach Chat**

GPT-4o-mini se chat — child ka poora context automatically inject hota hai. AI kabhi diagnostic labels (autism/ADHD/ASD etc.) use nahi karta.

```json
// Request Body — Single turn
{
  "messages": [
    { "role": "user", "content": "Why is Riya struggling with fine motor tasks?" }
  ]
}

// Request Body — Multi-turn
{
  "messages": [
    { "role": "user",      "content": "What activities help with fine motor?" },
    { "role": "assistant", "content": "Try finger painting and playdough..." },
    { "role": "user",      "content": "How long each day?" }
  ]
}

// Response 200
{
  "data": {
    "reply": "Based on Riya's current progress, 15-20 minutes daily works best..."
  }
}
```
> Max 20 messages per request. Each message max 2000 characters.

---

### POST `/api/ai/aac/:childId/log` 🔒
**P3 — AAC Usage Logging**

Kaunse symbols use kiye track karo (call karo jab user koi symbol press kare).
```json
// Request Body
{
  "symbolIds": [1, 2, 5, 8]
}

// Response 200
{ "data": { "count": 4 } }
```

---

### GET `/api/ai/aac/:childId/personalized` 🔒
**P3 — Personalized AAC Keyboard**

Usage history ke basis par personalized symbols — most used pehle, suggested activity ke basis par.
```json
// Response 200
{
  "data": {
    "childName": "Riya",
    "recent": [
      { "id": 1, "title": "Yes", "usageCount": 8, "categoryId": 79 },
      { "id": 2, "title": "No",  "usageCount": 5, "categoryId": 79 }
    ],
    "suggested": [
      { "id": 10, "title": "Happy", "categoryId": 80 }
    ]
  }
}
```

---

### GET `/api/ai/report/:childId` 🔒
**P4 — Therapist Progress Report**

GPT-generated full progress report — skill-framed language, no diagnostic labels.
```json
// Response 200
{
  "data": {
    "report": {
      "child": { "name": "Riya", "age": 6 },
      "reportPeriod": { "from": "2024-01-01", "to": "2024-01-15" },
      "skillAreas": ["Motor Skills", "Communication", "Social Interaction"],
      "strengths": [
        "Riya has shown excellent progress in play skills with 100% engagement..."
      ],
      "developingAreas": [
        "Social interaction skills are emerging, currently at 50%..."
      ],
      "recommendedFocus": [
        "Encourage cooperative play activities to build social skills..."
      ],
      "activityCompletion": {
        "completionRate": 0.75,
        "totalSessions": 20
      },
      "generatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

### GET `/api/ai/reassessment/:childId` 🔒
**P5 — Reassessment Intelligence**

Kya child ko reassessment ki zaroorat hai? Automatically 3 triggers check karta hai.
```json
// Response 200
{
  "data": {
    "needed": true,
    "urgency": "high",
    "reason": "Riya has shown consistent improvement for 6+ consecutive days. A new assessment will capture her progress accurately.",
    "triggers": ["consecutive_good_days"]
  }
}
```

| Field | Values |
|---|---|
| `needed` | `true` / `false` |
| `urgency` | `"high"` / `"medium"` / `null` |
| `triggers` | `consecutive_good_days`, `majority_high_scores`, `overdue` |

---

## Error Response Format

Saare errors isi format mein aate hain:
```json
{
  "message": "Error description here"
}
```

| HTTP Code | Matlab |
|---|---|
| 400 | Bad Request — galat input / validation fail |
| 401 | Unauthorized — token nahi hai ya expire ho gaya |
| 403 | Forbidden — yeh data tumhara nahi hai |
| 404 | Not Found — resource exist nahi karta |
| 429 | Too Many Requests — rate limit hit ho gayi |
| 500 | Internal Server Error |

---

## Quick Start Flow

```
1.  POST /api/auth/register              → account banao
2.  POST /api/auth/login                 → accessToken + refreshToken lo, store karo
3.  POST /api/child/register             → child profile banao, childId save karo
4.  GET  /api/form                       → questions fetch karo (ek baar, cache kar lo)
5.  POST /api/form/submit                → assessment answers submit karo
6.  GET  /api/activity/:childId          → recommended activities dekho
7.  PUT  /api/routine/:childId           → weekly routine set karo
8.  GET  /api/ai/routine/:childId/adaptive  → aaj ka AI-generated plan
9.  POST /api/ai/chat/:childId           → parent coach se poochho
10. GET  /api/ai/report/:childId         → therapist progress report
11. GET  /api/ai/reassessment/:childId   → kya reassessment chahiye?
12. GET  /api/acc                        → AAC keyboard load karo
13. POST /api/ai/aac/:childId/log        → symbol usage track karo
14. GET  /api/ai/aac/:childId/personalized → personalized AAC keyboard
```

---

## Token Management (Frontend Guide)

```
Login  → accessToken (15 min) + refreshToken (7 days) store karo
API call → accessToken header mein bhejo
401 aaye → POST /api/auth/refresh se naya accessToken lo
Logout → POST /api/auth/logout + local storage clear karo
```
