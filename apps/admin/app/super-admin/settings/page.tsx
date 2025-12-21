'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Save, AlertTriangle, Shield, Globe, Mail, DollarSign, Loader2 } from 'lucide-react';
import { getPlatformSettings, updatePlatformSettings, PlatformSettings } from '@/lib/services/settings';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Default fallback state matching PlatformSettings structure
    const [settings, setSettings] = useState<PlatformSettings>({
        general: {
            platformName: '',
            supportEmail: '',
            contactPhone: '',
            currency: 'CVE',
            timezone: 'Atlantic/Cape_Verde',
            defaultLanguage: 'pt',
        },
        financial: {
            serviceFeePercentage: 5,
            fixedFee: 0,
            minWithdrawalAmount: 1000,
            payoutSchedule: 'manual',
            taxRate: 0,
        },
        features: {
            enableRegistration: true,
            enableEventCreation: true,
            enablePayouts: true,
            maintenanceMode: false,
            requireEmailVerification: true,
        },
        appearance: {}
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                // Check if we need to access via Services.SettingsService
                const data = await getPlatformSettings();
                setSettings(data);
            } catch (error) {
                console.error('Failed to load settings:', error);
                toast.error('Erro ao carregar configurações');
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (!user?.uid) throw new Error('User not authenticated');

            await updatePlatformSettings(settings, user.uid);
            toast.success('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Configurações" requireSuperAdmin>
                <div className="flex items-center justify-center h-[50vh]">
                    <Loader2 size={32} className="animate-spin text-brand-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Configurações" requireSuperAdmin>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Configurações da Plataforma</h2>
                    <p className="text-sm text-zinc-500">Gerir parâmetros globais do sistema</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Settings */}
                    <div className="card">
                        <div className="card-header">
                            <div className="flex items-center gap-2">
                                <Globe className="text-brand-primary" size={20} />
                                <h3 className="card-title">Geral</h3>
                            </div>
                        </div>
                        <div className="card-body grid gap-6 md:grid-cols-2">
                            <div className="form-group">
                                <label className="form-label">Nome da Plataforma</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={settings.general.platformName}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        general: { ...settings.general, platformName: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email de Suporte</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-zinc-500" size={18} />
                                    <input
                                        type="email"
                                        className="form-input pl-10"
                                        value={settings.general.supportEmail}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            general: { ...settings.general, supportEmail: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Settings */}
                    <div className="card">
                        <div className="card-header">
                            <div className="flex items-center gap-2">
                                <DollarSign className="text-green-500" size={20} />
                                <h3 className="card-title">Financeiro</h3>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="form-group max-w-sm">
                                <label className="form-label">Taxa de Serviço (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="form-input pr-8"
                                        value={settings.financial.serviceFeePercentage}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            financial: { ...settings.financial, serviceFeePercentage: Number(e.target.value) }
                                        })}
                                    />
                                    <span className="absolute right-3 top-3 text-zinc-500">%</span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Taxa aplicada sobre cada bilhete vendido.</p>
                            </div>
                        </div>
                    </div>

                    {/* System Control */}
                    <div className="card border-red-900/30">
                        <div className="card-header">
                            <div className="flex items-center gap-2">
                                <Shield className="text-red-500" size={20} />
                                <h3 className="card-title">Controlo de Sistema</h3>
                            </div>
                        </div>
                        <div className="card-body space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary border border-border">
                                <div>
                                    <h4 className="font-medium text-[hsl(var(--foreground))]">Modo de Manutenção</h4>
                                    <p className="text-sm text-zinc-500">Desativa o acesso de utilizadores (exceto Super Admins)</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.features.maintenanceMode}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            features: { ...settings.features, maintenanceMode: e.target.checked }
                                        })}
                                    />
                                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary border border-border">
                                <div>
                                    <h4 className="font-medium text-[hsl(var(--foreground))]">Registo de Organizações</h4>
                                    <p className="text-sm text-zinc-500">Permitir que novas organizações se registem</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.features.enableRegistration}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            features: { ...settings.features, enableRegistration: e.target.checked }
                                        })}
                                    />
                                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary min-w-[150px]"
                        >
                            {saving ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Guardar Alterações</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
