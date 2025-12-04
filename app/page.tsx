"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";

const API_BASE = "http://localhost:8080";

type Player = {
    id: number;
    name: string;
    shirtNumber: number;
    position: string;
    team: string;
};

type PlayerForm = {
    name: string;
    shirtNumber: string; // string i form, konverteres til number ved submit
    position: string;
    team: string;
};

export default function HomePage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false);
    const [teamFilter, setTeamFilter] = useState("");
    const [form, setForm] = useState<PlayerForm>({
        name: "",
        shirtNumber: "",
        position: "",
        team: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    async function loadPlayers(team?: string) {
        try {
            setLoading(true);
            setError(null);
            let url = `${API_BASE}/players`;
            if (team && team.trim() !== "") {
                url += `?team=${encodeURIComponent(team.trim())}`;
            }

            const res = await fetch(url);
            if (!res.ok) {
                throw new Error("Kunne ikke hente spillere");
            }
            const data: Player[] = await res.json();
            setPlayers(data);
        } catch (e: unknown) {
            const msg =
                e instanceof Error ? e.message : "Noe gikk galt ved henting av spillere";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPlayers();
    }, []);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (!form.name || !form.shirtNumber || !form.position || !form.team) {
            setError("Alle felter må fylles ut.");
            return;
        }

        const payload = {
            name: form.name,
            shirtNumber: Number(form.shirtNumber),
            position: form.position,
            team: form.team,
        };

        try {
            const res = await fetch(`${API_BASE}/players`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error("Kunne ikke opprette spiller");
            }

            setMessage("Spiller opprettet!");
            setForm({
                name: "",
                shirtNumber: "",
                position: "",
                team: "",
            });

            await loadPlayers(teamFilter);
        } catch (e: unknown) {
            const msg =
                e instanceof Error
                    ? e.message
                    : "Noe gikk galt ved opprettelse av spiller";
            setError(msg);
        }
    }

    function handleFormChange(
        e: ChangeEvent<HTMLInputElement>
    ) {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleFilterSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        loadPlayers(teamFilter);
    }

    return (
        <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
            <h1>Football-spiller admin</h1>
            <p>Enkel frontend for å teste football-backend.</p>

            {/* Opprett spiller */}
            <section style={{ marginTop: "2rem", marginBottom: "2rem" }}>
                <h2>Opprett ny spiller</h2>
                <form
                    onSubmit={handleSubmit}
                    style={{ display: "grid", gap: "0.5rem", maxWidth: "400px" }}
                >
                    <input
                        type="text"
                        name="name"
                        placeholder="Navn"
                        value={form.name}
                        onChange={handleFormChange}
                    />
                    <input
                        type="number"
                        name="shirtNumber"
                        placeholder="Draktnummer"
                        value={form.shirtNumber}
                        onChange={handleFormChange}
                    />
                    <input
                        type="text"
                        name="position"
                        placeholder="Posisjon (f.eks. Striker)"
                        value={form.position}
                        onChange={handleFormChange}
                    />
                    <input
                        type="text"
                        name="team"
                        placeholder="Lag (f.eks. PSG)"
                        value={form.team}
                        onChange={handleFormChange}
                    />
                    <button type="submit">Lagre spiller</button>
                </form>
            </section>

            {/* Filter + liste */}
            <section>
                <h2>Spillere</h2>

                <form onSubmit={handleFilterSubmit} style={{ marginBottom: "1rem" }}>
                    <input
                        type="text"
                        placeholder="Filter på lag (f.eks. PSG)"
                        value={teamFilter}
                        onChange={(e) => setTeamFilter(e.target.value)}
                        style={{ marginRight: "0.5rem" }}
                    />
                    <button type="submit">Filtrer</button>
                    <button
                        type="button"
                        style={{ marginLeft: "0.5rem" }}
                        onClick={() => {
                            setTeamFilter("");
                            loadPlayers();
                        }}
                    >
                        Nullstill
                    </button>
                </form>

                {loading && <p>Laster spillere...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                {message && <p style={{ color: "green" }}>{message}</p>}

                <table
                    border={1}
                    cellPadding={4}
                    style={{ width: "100%", borderCollapse: "collapse" }}
                >
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Navn</th>
                        <th>Draktnummer</th>
                        <th>Posisjon</th>
                        <th>Lag</th>
                    </tr>
                    </thead>
                    <tbody>
                    {players.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ textAlign: "center" }}>
                                Ingen spillere funnet.
                            </td>
                        </tr>
                    ) : (
                        players.map((p) => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>{p.name}</td>
                                <td>{p.shirtNumber}</td>
                                <td>{p.position}</td>
                                <td>{p.team}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </section>
        </main>
    );
}