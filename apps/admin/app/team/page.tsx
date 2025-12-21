'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  DataTable,
  Button,
  RoleBadge,
  StatusBadge,
  ConfirmModal,
  Card,
  Modal,
  Input,
  Select,
} from '../../components/ui';
import type { Column } from '../../components/ui';
import {
  getTeamMembers,
  getInvitations,
  createInvitation,
  cancelInvitation,
  removeTeamMember,
  updateTeamMember,
  ROLE_PERMISSIONS,
  type TeamMember,
  type Invitation,
} from '../../lib/services/team';
import { useAuthStore } from '@/stores/authStore';
import {
  Plus,
  Users,
  Mail,
  Trash2,
  Pencil,
  RefreshCw,
  X,
} from 'lucide-react';

type OrganizationRole = 'admin' | 'promoter' | 'staff';

export default function TeamPage() {
  const { user, claims } = useAuthStore();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrganizationRole>('staff');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

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

  useEffect(() => {
    loadData();
  }, [claims]);

  const loadData = async () => {
    if (!claims?.organizationId) return;

    setIsLoading(true);
    try {
      const [membersData, invitationsData] = await Promise.all([
        getTeamMembers(claims.organizationId),
        getInvitations(claims.organizationId),
      ]);

      setMembers(membersData);
      setInvitations(invitationsData);
    } catch (error) {
      console.error('Error loading team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!claims?.organizationId || !inviteEmail) return;

    setIsInviting(true);
    setInviteError('');

    try {
      await createInvitation(claims.organizationId, {
        email: inviteEmail,
        role: inviteRole,
        invitedBy: user?.uid || '',
      });

      await loadData();
      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('staff');
    } catch (error: unknown) {
      console.error('Error sending invitation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setInviteError(errorMessage || 'Erro ao enviar convite');
    } finally {
      setIsInviting(false);
    }
  };

  const handleEditMember = async () => {
    if (!memberToEdit || !claims?.organizationId) return;

    setIsEditing(true);
    try {
      await updateTeamMember(claims.organizationId, memberToEdit.id, {
        role: editRole,
        permissions: ROLE_PERMISSIONS[editRole],
      });

      await loadData();
      setEditModalOpen(false);
      setMemberToEdit(null);
    } catch (error) {
      console.error('Error updating member:', error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !claims?.organizationId) return;

    setIsRemoving(true);
    try {
      await removeTeamMember(claims.organizationId, memberToRemove.id);
      await loadData();
      setRemoveModalOpen(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error('Error removing member:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleCancelInvitation = async () => {
    if (!invitationToCancel || !claims?.organizationId) return;

    setIsCanceling(true);
    try {
      await cancelInvitation(claims.organizationId, invitationToCancel.id);
      await loadData();
      setCancelModalOpen(false);
      setInvitationToCancel(null);
    } catch (error) {
      console.error('Error canceling invitation:', error);
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
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-purple-600 font-medium">
              {member.displayName?.charAt(0) || member.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {member.displayName || 'Sem nome'}
            </p>
            <p className="text-sm text-gray-500">{member.email}</p>
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
        <span className="text-sm text-gray-500">
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
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Editar"
          >
            <Pencil className="h-4 w-4 text-gray-500" />
          </button>
          <button
            onClick={() => {
              setMemberToRemove(member);
              setRemoveModalOpen(true);
            }}
            className="p-2 hover:bg-red-50 rounded-lg"
            title="Remover"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
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
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <span className="text-gray-900">{invitation.email}</span>
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
        <span className="text-sm text-gray-500">
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
            className="p-2 hover:bg-red-50 rounded-lg"
            title="Cancelar"
          >
            <X className="h-4 w-4 text-red-500" />
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Equipa</h1>
            <p className="text-gray-500">Gerencie os membros da sua organização</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={loadData}
              leftIcon={<RefreshCw className="h-5 w-5" />}
            >
              Atualizar
            </Button>
            <Button
              onClick={() => setInviteModalOpen(true)}
              leftIcon={<Plus className="h-5 w-5" />}
            >
              Convidar Membro
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                <p className="text-sm text-gray-500">Membros ativos</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Mail className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {invitations.filter((i) => i.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-500">Convites pendentes</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {members.filter((m) => m.role === 'admin').length}
                </p>
                <p className="text-sm text-gray-500">Administradores</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('members')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Membros ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invitations'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          setInviteError('');
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
          {inviteError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{inviteError}</p>
            </div>
          )}
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
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Permissões:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {ROLE_PERMISSIONS[inviteRole].map((permission) => (
                <li key={permission} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-purple-500 rounded-full" />
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
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Permissões:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {ROLE_PERMISSIONS[editRole].map((permission) => (
                <li key={permission} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-purple-500 rounded-full" />
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
