# Demo Support Portal

A neutral, single-page support portal used to demo an Agentforce Service Agent. The page embeds the agent's chat (Salesforce Messaging for In-App and Web) and has an "ask" bar that opens the chat with the typed question.

## Demo only: do not use in production

- The chat points at a **sandbox** org (`CHAT_CONFIG` in `app.js`).
- The hidden pre-chat field `userId` is **hard-coded** to a dedicated sandbox test user. The chat channel trusts this value to identify the visitor, so **everyone who opens this page chats as that test user** and can create cases on their behalf in the sandbox.
- A production page must pass the signed-in user's own identity (for example via Messaging's user verification), never a fixed Id.
- Keep this repository private.

## Run it locally

```bash
python3 -m http.server 8080
```

Open http://localhost:8080. The chat button appears at the bottom right after a few seconds.

## Example questions (tested against the sandbox agent)

| Chip | What the agent does |
|---|---|
| When does my contract renew? | Explains the user has no billing access and offers a case |
| Two users can't log in | Matches the product (Multi-Factor Authentication), asks one yes/no, builds a case summary, creates the case on confirm |
| Cancel my subscription | Declines to cancel and offers to route it to the right team |

## Files

- `index.html` - page layout
- `style.css` - neutral demo styling (follows the viewer's light/dark setting)
- `app.js` - chat configuration, widget loader, hidden pre-chat field, ask-bar wiring
