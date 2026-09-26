# Knowledge page

Run `npm run dev` and open `/admin/knowledge`.

The API defaults to `http://localhost:3000`. Set `VITE_API_BASE_URL` in `.env.local` to override it, then restart Vite. Store the JWT returned by login under the `accessToken` key in localStorage. The Axios interceptor reads it on every request and sends `Authorization: Bearer <token>`.

The frontend expects these routes, configured in `src/hooks/useKnowledge.ts`:

| Method | Route | Request |
| --- | --- | --- |
| GET | `/knowledge` | None |
| POST | `/knowledge/upload` | Multipart form with a PDF in `file` |
| POST | `/knowledge/url` | JSON `{ "url": "https://example.com" }` |
| POST | `/knowledge/qa` | JSON `{ "question": "Check-in time?", "answer": "2 PM" }` |
| DELETE | `/knowledge/:id` | None |

The list response must be an array of sources or `{ "knowledge_sources": [...] }`. Each source has `id` (number), `type` (`pdf`, `url`, or `qa`), `title`, `originalRef`, and `createdAt` (date string), matching the local backend entity. Successful mutations refresh the list.

The current sibling backend does not implement these mutation routes. Its existing `GET /knowledge` returns Ollama models rather than knowledge sources. Backend implementation is required before these operations can work end to end; the frontend displays API failures and rejects the incompatible list response.
