'use client';

import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  DataTable,
  Button,
  RoleBadge,
  StatusBadge,
  ConfirmModal,
  StatCard,
  Modal,
  Input,
  Select,
} from '../../components/ui';
import type { Column } from '../../components/ui';
import { useOrganizationTeam, type TeamMember, type Invitation } from '@/hooks/useOrganizationTeam';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/contexts/ToastContext';
import { addDoc, collection, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Plus,
  Users,
  Mail,
  Trash2,
  Pencil,
  X,
  UserCheck,
  UserPlus,
  Shield,
} from 'lucide-react';

type OrganizationRole = 'admin' | 'promoter' | 'staff';

const ROLE_PERMISSIONS: Record<OrganizationRole, string[]> = {
  admin: ['manage_team', 'manage_events', 'manage_tickets', 'view_analytics', 'manage_finance'],
  promoter: ['manage_events', 'manage_tickets', 'view_analytics'],
  staff: ['manage_tickets', 'check_in'],
};

export default function TeamPage() {
  const { user, organization } = useAuthStore();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');

  // Fetch team data with real-time updates
  const { members, invitations, stats, loading: isLoading } = useOrganizationTeam(organization?.id);

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrganizationRole>('staff');
  const [isInviting, setIsInviting] = useState(false);

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState<OrganizationRole>('staff');
  const [isEditing, setIsEditing] = useState(false);

  // Remove/Cancel modals
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [invitationToCancel, setInvitationToCancel] = useState<Invitation | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleInvite = async () => {
    if (!organization?.id || !inviteEmail) return;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      showToast('error', 'Email Inválido', 'Por favor insira um email válido');
      return;
    }

    setIsInviting(true);

    try {
      const invitationsRef = collection(db, 'invitations');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      await addDoc(invitationsRef, {
        organizationId: organization.id,
        email: inviteEmail,
        role: inviteRole,
        status: 'pending',
        invitedBy: user?.uid || '',
        invitedByName: user?.displayName || user?.email || 'Admin',
        createdAt: serverTimestamp(),
        expiresAt,
      });

      showToast('success', 'Convite Enviado', `Convite enviado para ${inviteEmail}`);
      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('staff');
    } catch (error) {
      console.error('Error sending invitation:', error);
      showToast('error', 'Erro', 'Erro ao enviar convite. Tente novamente.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleEditMember = async () => {
    if (!memberToEdit || !organization?.id) return;

    setIsEditing(true);
    try {
      const memberRef = doc(db, 'organizations', organization.id, 'members', memberToEdit.id);
      await updateDoc(memberRef, {
        role: editRole,
        permissions: ROLE_PERMISSIONS[editRole],
      });

      showToast('success', 'Membro Atualizado', 'A função do membro foi atualizada');
      setEditModalOpen(false);
      setMemberToEdit(null);
    } catch (error) {
      console.error('Error updating member:', error);
      showToast('error', 'Erro', 'Erro ao atualizar membro');
    } finally {
      setIsEditing(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !organization?.id) return;

    setIsRemoving(true);
    try {
      const memberRef = doc(db, 'organizations', organization.id, 'members', memberToRemove.id);
      await deleteDoc(memberRef);

      showToast('success', 'Membro Removido', 'O membro foi removido da equipa');
      setRemoveModalOpen(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error('Error removing member:', error);
      showToast('error', 'Erro', 'Erro ao remover membro');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleCancelInvitation = async () => {
    if (!invitationToCancel) return;

    setIsCanceling(true);
    try {
      const invitationRef = doc(db, 'invitations', invitationToCancel.id);
      await updateDoc(invitationRef, {
        status: 'expired',
      });

      showToast('success', 'Convite Cancelado', 'O convite foi cancelado');
      setCancelModalOpen(false);
      setInvitationToCancel(null);
    } catch (error) {
      console.error('Error canceling invitation:', error);
      showToast('error', 'Erro', 'Erro ao cancelar convite');
    } finally {
      setIsCanceling(false);
    }
  };

  const memberColumns: Column<TeamMember>[] = [
    {
      key: 'displayName',
      header: 'Membro',
      render: (member) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
            <span className="text-brand-primary font-semibold">
              {member.displayName?.charAt(0) || member.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-[hsl(var(--foreground))]">
              {member.displayName || 'Sem nome'}
            </p>
            <p className="text-sm text-[hsl(var(--foreground-secondary))]">{member.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Função',
      render: (member) => (
        <RoleBadge role={member.role === 'admin' ? 'org_admin' : member.role as 'promoter' | 'staff'} />
      ),
    },
    {
      key: 'joinedAt',
      header: 'Membro desde',
      render: (member) => (
        <span className="text-sm text-[hsl(var(--foreground-secondary))]">
          {member.joinedAt.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (member) => (
        <StatusBadge status={member.isActive ? 'active' : 'suspended'} />
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      width: '100px',
      render: (member) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setMemberToEdit(member);
              setEditRole(member.role as OrganizationRole);
              setEditModalOpen(true);
            }}
            className="p-2 hover:bg-[hsl(var(--background-tertiary))] rounded-lg transition-colors"
            title="Editar"
          >
            <Pencil className="h-4 w-4 text-[hsl(var(--foreground-muted))]" />
          </button>
          <button
            onClick={() => {
              setMemberToRemove(member);
              setRemoveModalOpen(true);
            }}
            className="p-2 hover:bg-[hsl(var(--error))]/10 rounded-lg transition-colors"
            title="Remover"
          >
            <Trash2 className="h-4 w-4 text-[hsl(var(--error))]" />
          </button>
        </div>
      ),
    },
  ];

  const invitationColumns: Column<Invitation>[] = [
    {
      key: 'email',
      header: 'Email',
      render: (invitation) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[hsl(var(--background-tertiary))] flex items-center justify-center">
            <Mail className="h-5 w-5 text-[hsl(var(--foreground-muted))]" />
          </div>
          <span className="text-[hsl(var(--foreground))]">{invitation.email}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Função',
      render: (invitation) => (
        <RoleBadge role={invitation.role === 'admin' ? 'org_admin' : invitation.role as 'promoter' | 'staff'} />
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (invitation) => <StatusBadge status={invitation.status} />,
    },
    {
      key: 'expiresAt',
      header: 'Expira em',
      render: (invitation) => (
        <span className="text-sm text-[hsl(var(--foreground-secondary))]">
          {invitation.expiresAt.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      width: '80px',
      render: (invitation) =>
        invitation.status === 'pending' && (
          <button
            onClick={() => {
              setInvitationToCancel(invitation);
              setCancelModalOpen(true);
            }}
            className="p-2 hover:bg-[hsl(var(--error))]/10 rounded-lg transition-colors"
            title="Cancelar"
          >
            <X className="h-4 w-4 text-[hsl(var(--error))]" />
          </button>
        ),
    },
  ];

  const roleOptions = [
    { value: 'admin', label: 'Administrador' },
    { value: 'promoter', label: 'Promotor' },
    { value: 'staff', label: 'Staff' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Equipa</h1>
              <p className="text-[hsl(var(--foreground-secondary))]">Gerencie os membros da sua organização</p>
            </div>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 border border-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-semibold text-success uppercase tracking-wide">Live</span>
            </span>
          </div>
          <Button
            onClick={() => setInviteModalOpen(true)}
            leftIcon={<Plus className="h-5 w-5" />}
          >
            Convidar Membro
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="stat-card">
                  <div className="skeleton h-12 w-24 mb-2" />
                  <div className="skeleton h-4 w-32" />
                </div>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total de Membros"
                value={stats.totalMembers.toString()}
                icon={<Users size={24} />}
              />
              <StatCard
                title="Membros Ativos"
                value={stats.activeMembers.toString()}
                icon={<UserCheck size={24} />}
                change={{
                  value: stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0,
                  label: 'taxa',
                }}
              />
              <StatCard
                title="Convites Pendentes"
                value={stats.pendingInvitations.toString()}
                icon={<UserPlus size={24} />}
              />
              <StatCard
                title="Administradores"
                value={stats.adminCount.toString()}
                icon={<Shield size={24} />}
              />
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-[hsl(var(--border-color))]">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('members')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'members'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border-color))]'
              }`}
            >
              Membros ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'invitations'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border-color))]'
              }`}
            >
              Convites ({invitations.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'members' ? (
          <DataTable
            columns={memberColumns}
            data={members}
            keyExtractor={(member) => member.id}
            isLoading={isLoading}
            emptyMessage="Nenhum membro na equipa"
          />
        ) : (
          <DataTable
            columns={invitationColumns}
            data={invitations}
            keyExtractor={(invitation) => invitation.id}
            isLoading={isLoading}
            emptyMessage="Nenhum convite enviado"
          />
        )}
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => {
          setInviteModalOpen(false);
          setInviteEmail('');
          setInviteRole('staff');
        }}
        title="Convidar Membro"
        description="Envie um convite para adicionar um novo membro à sua equipa"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setInviteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleInvite} isLoading={isInviting}>
              Enviar Convite
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@exemplo.com"
            required
          />
          <Select
            label="Função"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as OrganizationRole)}
            options={roleOptions}
          />
          <div className="p-3 bg-[hsl(var(--background-tertiary))] rounded-lg border border-[hsl(var(--border-color))]">
            <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-2">Permissões:</p>
            <ul className="text-sm text-[hsl(var(--foreground-secondary))] space-y-1">
              {ROLE_PERMISSIONS[inviteRole].map((permission) => (
                <li key={permission} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-brand-primary rounded-full" />
                  {permission.replace(/_/g, ' ')}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setMemberToEdit(null);
        }}
        title="Editar Membro"
        description={`Atualizar função de ${memberToEdit?.displayName || memberToEdit?.email}`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEditModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditMember} isLoading={isEditing}>
              Guardar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Função"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value as OrganizationRole)}
            options={roleOptions}
          />
          <div className="p-3 bg-[hsl(var(--background-tertiary))] rounded-lg border border-[hsl(var(--border-color))]">
            <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-2">Permissões:</p>
            <ul className="text-sm text-[hsl(var(--foreground-secondary))] space-y-1">
              {ROLE_PERMISSIONS[editRole].map((permission) => (
                <li key={permission} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-brand-primary rounded-full" />
                  {permission.replace(/_/g, ' ')}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>

      {/* Remove Member Confirmation */}
      <ConfirmModal
        isOpen={removeModalOpen}
        onClose={() => {
          setRemoveModalOpen(false);
          setMemberToRemove(null);
        }}
        onConfirm={handleRemoveMember}
        title="Remover Membro"
        message={`Tem a certeza que deseja remover ${memberToRemove?.displayName || memberToRemove?.email} da equipa?`}
        confirmText="Remover"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isRemoving}
      />

      {/* Cancel Invitation Confirmation */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setInvitationToCancel(null);
        }}
        onConfirm={handleCancelInvitation}
        title="Cancelar Convite"
        message={`Tem a certeza que deseja cancelar o convite para ${invitationToCancel?.email}?`}
        confirmText="Cancelar Convite"
        cancelText="Voltar"
        variant="warning"
        isLoading={isCanceling}
      />
    </DashboardLayout>
  );
}
