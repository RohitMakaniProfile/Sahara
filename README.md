# Sahara application backend

## Child Daily Routine + Daily Check-ins

All endpoints below are under the `/api` prefix and require `Authorization: Bearer <accessToken>`.

### Set/Replace weekly routine template

```bash
curl -X PUT "http://localhost:3000/api/child/1/routine" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "timezone": "Asia/Kolkata",
    "name": "Default",
    "week": {
      "MON": [
        { "startMinute": 450, "endMinute": 510, "title": "Breakfast", "order": 0 },
        { "startMinute": 600, "endMinute": 660, "title": "Therapy", "order": 1 }
      ],
      "TUE": [],
      "WED": [],
      "THU": [],
      "FRI": [],
      "SAT": [],
      "SUN": []
    }
  }'
```

### Mark a routine item as done (daily check-in upsert)

```bash
curl -X PUT "http://localhost:3000/api/child/1/routine/checkins" \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": 10,
    "date": "2026-02-22",
    "status": "DONE",
    "note": "Completed with minimal prompting"
  }'
```

