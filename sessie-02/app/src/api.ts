export type Tone = "hartelijk" | "grappig" | "formeel" | "kort";

export interface Friend {
  id: string;
  name: string;
  birthdate: string; // YYYY-MM-DD
  phone: string;
  tone: Tone;
  note: string;
}

const BASE = "http://localhost:3001";

export async function getFriends(): Promise<Friend[]> {
  const r = await fetch(`${BASE}/api/friends`);
  return r.json();
}

export async function addFriend(f: Omit<Friend, "id">): Promise<Friend> {
  const r = await fetch(`${BASE}/api/friends`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(f),
  });
  if (!r.ok) throw new Error((await r.json()).error || "Toevoegen mislukt");
  return r.json();
}

export async function deleteFriend(id: string): Promise<void> {
  await fetch(`${BASE}/api/friends/${id}`, { method: "DELETE" });
}
