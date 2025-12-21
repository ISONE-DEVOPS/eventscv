'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Settings, Save, Lock, Loader2 } from 'lucide-react';

export default function PagaliIntegrationPage() {
    const [apiKey, setApiKey] = useState('');
    const [secret, setSecret] = useState('');
    const [environment, setEnvironment] = useState('sandbox');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Load existing config on mount
    useEffect(() => {
        fetch('/api/pagali/config')
            .then((res) => res.json())
            .then((data) => {
                if (data.apiKey) setApiKey(data.apiKey);
                if (data.secret) setSecret(data.secret);
                if (data.environment) setEnvironment(data.environment);
            })
            .catch((err) => console.error('Error loading config:', err))
            .finally(() => setInitialLoading(false));
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

    if (initialLoading) {
        return (
            <DashboardLayout title="Integração Pagali" requireSuperAdmin>
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="animate-spin text-brand-primary" size={32} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Integração Pagali" requireSuperAdmin>
            <div className="max-w-2xl mx-auto">
                <div className="card">
                    <div className="card-header">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                                <Settings className="text-brand-primary" size={20} />
                            </div>
                            <div>
                                <h2 className="card-title">Configurações de API</h2>
                                <p className="text-sm text-zinc-400">Gerir credenciais de conexão ao Pagali</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="form-group">
                                <label className="form-label" htmlFor="apiKey">API Key</label>
                                <div className="relative">
                                    <input
                                        id="apiKey"
                                        type="text"
                                        className="form-input"
                                        placeholder="Introduza a sua API Key"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="secret">Secret Key</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={16} className="text-zinc-500" />
                                    </div>
                                    <input
                                        id="secret"
                                        type="password"
                                        className="form-input pl-10"
                                        placeholder="••••••••••••••••"
                                        value={secret}
                                        onChange={(e) => setSecret(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="environment">Ambiente</label>
                                <select
                                    id="environment"
                                    className="form-select w-full"
                                    value={environment}
                                    onChange={(e) => setEnvironment(e.target.value)}
                                >
                                    <option value="sandbox">Sandbox (Teste)</option>
                                    <option value="production">Produção</option>
                                </select>
                                <p className="text-xs text-zinc-500 mt-2">
                                    Use o ambiente de Sandbox para testes e desenvolvimento. Mude para Produção apenas quando estiver pronto para processar pagamentos reais.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary min-w-[120px]"
                                >
                                    {loading ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            <span>Guardar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
