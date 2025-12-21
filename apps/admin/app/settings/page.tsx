'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, Button, Input, Textarea, Switch, FormSection, AlertModal } from '../../components/ui';
import {
  getOrganizationSettings,
  updateOrganizationSettings,
  type OrganizationSettings,
} from '../../lib/services/organizations';
import { useAuthStore } from '@/stores/authStore';
import {
  Building2,
  Bell,
  CreditCard,
  Shield,
  Globe,
  Image,
} from 'lucide-react';

export default function SettingsPage() {
  const { claims } = useAuthStore();
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('organization');

  // Organization settings
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [orgLogo, setOrgLogo] = useState('');

  // Payment settings
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIban, setBankIban] = useState('');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [salesAlerts, setSalesAlerts] = useState(true);
  const [checkInAlerts, setCheckInAlerts] = useState(true);
  const [payoutAlerts, setPayoutAlerts] = useState(true);

  // Alert
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, [claims]);

  const loadSettings = async () => {
    if (!claims?.organizationId) return;

    setIsLoading(true);
    try {
      const data = await getOrganizationSettings(claims.organizationId);
      if (data) {
        setSettings(data);
        // Populate form fields
        setOrgName(data.name || '');
        setOrgDescription(data.description || '');
        setOrgEmail(data.email || '');
        setOrgPhone(data.phone || '');
        setOrgWebsite(data.website || '');
        setOrgLogo(data.logoUrl || '');
        setBankName(data.bankDetails?.bankName || '');
        setBankAccount(data.bankDetails?.accountNumber || '');
        setBankIban(data.bankDetails?.iban || '');
        setEmailNotifications(data.notifications?.email ?? true);
        setSmsNotifications(data.notifications?.sms ?? false);
        setSalesAlerts(data.notifications?.salesAlerts ?? true);
        setCheckInAlerts(data.notifications?.checkInAlerts ?? true);
        setPayoutAlerts(data.notifications?.payoutAlerts ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!claims?.organizationId) return;

    setIsSaving(true);
    try {
      await updateOrganizationSettings(claims.organizationId, {
        name: orgName,
        description: orgDescription,
        email: orgEmail,
        phone: orgPhone,
        website: orgWebsite,
        logoUrl: orgLogo,
        bankDetails: {
          bankName,
          accountNumber: bankAccount,
          iban: bankIban,
        },
        notifications: {
          email: emailNotifications,
          sms: smsNotifications,
          salesAlerts,
          checkInAlerts,
          payoutAlerts,
        },
      });

      setAlertType('success');
      setAlertMessage('Configurações guardadas com sucesso!');
      setAlertOpen(true);
    } catch (error) {
      console.error('Error saving settings:', error);
      setAlertType('error');
      setAlertMessage('Erro ao guardar configurações. Tente novamente.');
      setAlertOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'organization', label: 'Organização', icon: Building2 },
    { id: 'payment', label: 'Pagamento', icon: CreditCard },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-500">Gerencie as configurações da sua organização</p>
          </div>
          <Button onClick={handleSave} isLoading={isSaving}>
            Guardar Alterações
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'organization' && (
          <Card>
            <FormSection
              title="Informações da Organização"
              description="Dados básicos da sua organização"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome da Organização"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Nome da empresa"
                  required
                />
                <Input
                  label="Email de Contacto"
                  type="email"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                  placeholder="email@empresa.cv"
                />
              </div>

              <Textarea
                label="Descrição"
                value={orgDescription}
                onChange={(e) => setOrgDescription(e.target.value)}
                placeholder="Descreva a sua organização..."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Telefone"
                  value={orgPhone}
                  onChange={(e) => setOrgPhone(e.target.value)}
                  placeholder="+238 xxx xxxx"
                />
                <Input
                  label="Website"
                  value={orgWebsite}
                  onChange={(e) => setOrgWebsite(e.target.value)}
                  placeholder="https://..."
                  leftIcon={<Globe size={20} />}
                />
              </div>

              <Input
                label="URL do Logotipo"
                value={orgLogo}
                onChange={(e) => setOrgLogo(e.target.value)}
                placeholder="https://..."
                leftIcon={<Image size={20} />}
              />
              {orgLogo && (
                <div className="mt-2">
                  <img
                    src={orgLogo}
                    alt="Logo preview"
                    className="h-20 object-contain"
                  />
                </div>
              )}
            </FormSection>
          </Card>
        )}

        {activeTab === 'payment' && (
          <Card>
            <FormSection
              title="Dados Bancários"
              description="Informações para receber pagamentos"
            >
              <Input
                label="Nome do Banco"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Ex: BCA, BCN, Caixa Económica"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Número da Conta"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Número da conta"
                />
                <Input
                  label="IBAN"
                  value={bankIban}
                  onChange={(e) => setBankIban(e.target.value)}
                  placeholder="CV..."
                />
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Os seus dados bancários são usados apenas para processar levantamentos.
                  Todos os dados são encriptados e armazenados de forma segura.
                </p>
              </div>
            </FormSection>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card>
            <FormSection
              title="Preferências de Notificação"
              description="Configure como deseja receber notificações"
            >
              <div className="space-y-4">
                <Switch
                  checked={emailNotifications}
                  onChange={setEmailNotifications}
                  label="Notificações por Email"
                  description="Receber notificações importantes por email"
                />

                <Switch
                  checked={smsNotifications}
                  onChange={setSmsNotifications}
                  label="Notificações por SMS"
                  description="Receber alertas urgentes por SMS"
                />

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="font-medium text-gray-900 mb-4">Tipos de Alertas</h4>

                  <div className="space-y-4">
                    <Switch
                      checked={salesAlerts}
                      onChange={setSalesAlerts}
                      label="Alertas de Vendas"
                      description="Notificar quando novos bilhetes são vendidos"
                    />

                    <Switch
                      checked={checkInAlerts}
                      onChange={setCheckInAlerts}
                      label="Alertas de Check-in"
                      description="Resumo de check-ins durante o evento"
                    />

                    <Switch
                      checked={payoutAlerts}
                      onChange={setPayoutAlerts}
                      label="Alertas de Pagamento"
                      description="Notificar quando levantamentos são processados"
                    />
                  </div>
                </div>
              </div>
            </FormSection>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card>
            <FormSection
              title="Segurança da Conta"
              description="Gerencie a segurança da sua organização"
            >
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Autenticação</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    A sua conta está protegida com autenticação Firebase.
                  </p>
                  <Button variant="outline" size="sm">
                    Alterar Palavra-passe
                  </Button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Sessões Ativas</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Gerencie os dispositivos onde está conectado.
                  </p>
                  <Button variant="outline" size="sm">
                    Ver Sessões
                  </Button>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-900 mb-2">Zona de Perigo</h4>
                  <p className="text-sm text-red-700 mb-4">
                    Ações irreversíveis que afetam a sua organização.
                  </p>
                  <Button variant="danger" size="sm">
                    Eliminar Organização
                  </Button>
                </div>
              </div>
            </FormSection>
          </Card>
        )}
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        title={alertType === 'success' ? 'Sucesso' : 'Erro'}
        message={alertMessage}
        type={alertType}
      />
    </DashboardLayout>
  );
}
