![Poof40 Banner](https://github.com/yashjhota/Poof40Chatapp/blob/main/Images/Screenshot%202025-04-15%20232121.png)

# 💬 Poof40 — Real-Time Chat That *Disappears* 💨

**Poof40** is a sleek, real-time chat app where messages vanish like magic after 40 seconds! ✨  
Join instantly, chat publicly, and watch the conversation *poof* away.  
Perfect for ephemeral fun, lightweight conversations, or just a cool demo of real-time tech!

---

## 🚀 Features

✅ **Instant Join** — Just enter your name to join  
💬 **Real-time Messaging** — Powered by Supabase subscriptions  
🕓 **Self-Destructing Messages** — Messages auto-delete after 40 seconds using a PostgreSQL trigger  
🎨 **Beautiful UI** — Clean and modern, styled with Tailwind CSS  
🫂 **Message Bubbles** — Your messages have a different color than others’  
📱 **Responsive Design** — Works great on all screen sizes  
🔁 **Auto-Scroll** — Always scrolls to the latest message for seamless experience

---

## 🛠️ Built With

- 🧠 [Supabase](https://supabase.io/) — Real-time database, auth, and storage  
- 🧾 UUID — For generating unique user identifiers  
- 🎨 Tailwind CSS — For styling and responsive layout  
- 💡 Lucide React — Clean and customizable icon set  
- 🐘 PostgreSQL Trigger — Automatically deletes messages after 40 seconds  

---

## 📸 Preview

> [MainPage](https://github.com/yashjhota/Poof40Chatapp/blob/main/Images/Screenshot%202025-04-15%20231245.png)
> [ChatPage](https://github.com/yashjhota/Poof40Chatapp/blob/main/Images/Screenshot%202025-04-15%20232038.png)

---

## 🧑‍💻 Getting Started

Clone the repo and install dependencies:

```bash
git clone https://github.com/yashjhota/Poof40Chatapp.git
cd poof40
npm install
npm run dev
```

## ✨ Environment Setup

Create a .env file in the root directory with your Supabase project credentials:
```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
## 🧠 PostgreSQL Trigger Setup

In Supabase SQL editor, run the following to auto-delete messages after 40 seconds:

```bash
CREATE OR REPLACE FUNCTION delete_old_messages()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM messages WHERE inserted_at < NOW() - INTERVAL '40 seconds';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_delete_messages
AFTER INSERT ON messages
EXECUTE FUNCTION delete_old_messages();
```
This trigger removes old messages each time a new one is added.

## 🌐 Live Demo

🔗 [Poof40](https://jhotapoof40.netlify.app/)

## 💡 Inspired by the idea of letting go... 🕊️
No history. No pressure. Just talk and let it go — like it was never there.

