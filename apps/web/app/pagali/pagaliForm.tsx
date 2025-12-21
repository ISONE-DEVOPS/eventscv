'use client';

import { useState, useEffect } from 'react';
export default function PagaliForm() {
    const [apiKey, setApiKey] = useState('');
    const [secret, setSecret] = useState('');
    const [environment, setEnvironment] = useState('sandbox');
    const [loading, setLoading] = useState(false);

    // Load existing config on mount
    useEffect(() => {
        fetch('/api/pagali/config')
            .then((res) => res.json())
            .then((data) => {
                if (data.apiKey) setApiKey(data.apiKey);
                if (data.secret) setSecret(data.secret);
                if (data.environment) setEnvironment(data.environment);
            })
            .catch(() => { });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/pagali/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey, secret, environment }),
            });
            if (res.ok) {
                alert('Configurações guardadas com sucesso!');
            } else {
                alert('Erro ao guardar configurações.');
            }
        } catch (err) {
            alert('Erro de rede.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="glass-card p-6 max-w-md mx-auto" onSubmit={handleSubmit}>
            <h2 className="text-xl font-display text-white mb-4">Configurações Pagali</h2>
            <div className="mb-4">
                <label className="block text-zinc-300 mb-1" htmlFor="apiKey">API Key</label>
                <input
                    id="apiKey"
                    type="text"
                    className="w-full bg-transparent border border-zinc-600 rounded p-2 text-white"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-zinc-300 mb-1" htmlFor="secret">Secret</label>
                <input
                    id="secret"
                    type="password"
                    className="w-full bg-transparent border border-zinc-600 rounded p-2 text-white"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-zinc-300 mb-1" htmlFor="environment">Ambiente</label>
                <select
                    id="environment"
                    className="w-full bg-transparent border border-zinc-600 rounded p-2 text-white"
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                >
                    <option value="sandbox">Sandbox</option>
                    <option value="production">Produção</option>
                </select>
            </div>
            <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
            >
                {loading ? 'A guardar...' : 'Guardar'}
            </button>
        </form>
    );
}
