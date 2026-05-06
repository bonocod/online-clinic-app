# Online Clinic

A full-stack MERN online clinic platform with appointments, forums, professional consoles, live health education sessions, and a Public Health Hub.

## Run & Operate

| Command | Purpose |
|---|---|
| `cd backend && PORT=8000 npm start` | Start Express API (port 8000) |
| `cd frontend && PORT=5000 npm start` | Start React dev server (port 5000, webview) |

**Workflows:**
- `Backend` → `cd backend && PORT=8000 npm start`
- `Start application` → `cd frontend && PORT=5000 npm start`

**Required env vars** (in `backend/.env`): `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`

## Stack

- **Frontend:** React 18 (CRA / react-scripts 5), Axios, Socket.IO-client, Framer Motion, Lucide, `@livekit/components-react`
- **Backend:** Node.js + Express + Mongoose (MongoDB Atlas), Socket.IO, Cloudinary, `livekit-server-sdk`
- **Auth:** JWT tokens via localStorage
- **Realtime:** Socket.IO rooms per feature area

## Where things live

```
backend/src/
  controllers/publicHealthController.js  ← Public Health + LiveKit token logic
  models/OfficialNews.js                 ← has institutionName, institutionBadge
  models/LiveTeachingEvent.js
  routes/publicHealth.js                 ← all /api/public-health/* routes

frontend/src/
  pages/PublicHealth.jsx                 ← Hub overview (news + events only)
  pages/PublicHealthNews.jsx             ← Updates/alerts with institution badge
  pages/PublicHealthEvents.jsx           ← Events list with status filter
  pages/PublicHealthEventDetail.jsx      ← LiveKit video + Q&A
  pages/Admin.jsx                        ← Admin console (phSubTabs: news, events)
  utils/socket.js                        ← Socket.IO helpers incl. public health rooms
  services/api.js                        ← Axios instance (baseURL: "/api" → proxied)
  setupProxy.js                          ← CRA proxy: /api + /socket.io → localhost:8000
```

## Architecture decisions

- **Backend on port 8000, frontend on port 5000** — Replit webview requires port 5000; `frontend/src/setupProxy.js` proxies `/api` and `/socket.io` to port 8000
- **LiveKit viewer tokens** — issued by backend (`getLiveKitToken`), canPublish: false; host tokens (`getHostLiveKitToken`) via admin-only route with canPublish: true
- **syncEventStatus uses updateOne** — avoids Mongoose full-document validation on legacy DB records missing required fields
- **FAST_REFRESH=false in frontend/.env** — disables CRA react-refresh injection that conflicted with LiveKit packages installed via `--legacy-peer-deps`
- **Socket URL is empty string** — connects to same origin, proxied to backend via setupProxy.js

## Product

- Patient dashboard, disease library, health behaviors tracker
- Forum with groups, posts, discussions
- Live sessions (generic) and professional consoles (Doctor, CHW)
- **Public Health Hub:** official news/alerts with institution name + badge ("In partnership with…"), live teaching events with LiveKit video streaming + real-time Q&A
- Admin console: manage news/updates (with institution fields) and live events (publish, go live, end stream)

## User preferences

- Do NOT break existing features
- Do NOT change MongoDB Atlas connection
- Follow clean architecture
- No campaigns/tips in Public Health Hub UI (phSubTabs: news, events only)

## Gotchas

- The CRA proxy (`frontend/package.json` `"proxy"` field) handles HTTP; `setupProxy.js` handles WebSocket upgrade for Socket.IO
- `SKIP_PREFLIGHT_CHECK=true` and `FAST_REFRESH=false` must be in `frontend/.env`
- `syncEventStatus` must use `updateOne` (not `save()`) to avoid Mongoose validation errors on legacy event documents
- LiveKit env vars: `LIVEKIT_URL` must be a `wss://` WebSocket URL for the backend SDK; the client uses the same URL for browser connections
