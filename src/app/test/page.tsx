"use client";

import { useState } from "react";
import Cookies from "js-cookie";

export default function DateRangeFetcher() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const API_URL = "http://localhost:8000";

    async function fetchData() {
        setLoading(true);
        setError(null);

        try {

            const token = Cookies.get("access");
            const res = await fetch(
                `${API_URL}/attendance/range/?start_date=${startDate}&end_date=${endDate}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                }
            );

            if (!res.ok) {
                throw new Error(`Request failed: ${res.status}`);
            }

            const result = await res.json();
            console.log("Fetched data:", result);
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Fetch Data by Date Range</h2>

            <div style={{ display: "flex", gap: 10 }}>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />

                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />

                <button onClick={fetchData} disabled={!startDate || !endDate}>
                    Fetch
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {data && (
                <pre style={{ marginTop: 20 }}>
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
}
