'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import DataTable, { Column } from '@/components/ui/DataTable';
import { RoleBadge, StatusBadge } from '@/components/ui/Badge';
import { Plus, Edit, Ban, CheckCircle, Lock, RefreshCw } from 'lucide-react';
import { UsersService } from '@/lib/services';
import { toast } from 'react-hot-toast';
import { DocumentSnapshot } from 'firebase/firestore';

// Define Interface locally to match Service return
interface User {
    id: string;
    displayName: string;
    email: string;
    role: 'super_admin' | 'org_admin' | 'promoter' | 'staff' | 'user';
    isActive: boolean;
    organizationId?: string;
    lastLoginAt?: Date;
    [key: string]: any;
}

export default function UsersPage() {
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [cursors, setCursors] = useState<{ [key: number]: DocumentSnapshot | undefined }>({ 1: undefined });
    const [hasMore, setHasMore] = useState(false);

    const loadUsers = useCallback(async (currentPage: number, currentCursors: { [key: number]: DocumentSnapshot | undefined }) => {
        setLoading(true);
        try {
            const cursor = currentCursors[currentPage];
            const { users, lastDoc } = await UsersService.getUsers(
                undefined,
                { pageSize, lastDoc: cursor || undefined }
            );
            setData(users as unknown as User[]);

            // Update next cursor
            if (lastDoc) {
                setCursors(prev => ({ ...prev, [currentPage + 1]: lastDoc }));
            }
            // Simple check
            setHasMore(users.length === pageSize);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Erro ao carregar utilizadores');
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    useEffect(() => {
        loadUsers(page, cursors);
    }, [page, pageSize, loadUsers]);

    const handleNextPage = () => {
        if (hasMore) {
            setPage(p => p + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(p => p - 1);
        }
    };

    const handleRefresh = () => {
        setPage(1);
        setCursors({ 1: undefined });
        loadUsers(1, { 1: undefined });
    }

    const handleStatusChange = async (userId: string, isActive: boolean) => {
        if (!confirm(`Tem a certeza que deseja ${isActive ? 'suspender' : 'ativar'} este utilizador?`)) return;

        try {
            if (isActive) {
                await UsersService.suspendUser(userId, 'Admin Action');
            } else {
                await UsersService.reactivateUser(userId);
            }
            loadUsers(page, cursors);
            toast.success('Estado atualizado com sucesso');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Erro ao atualizar estado');
        }
    };

    // Filter Logic (Client-side for now)
    const filteredData = data.filter((user) =>
        (user.displayName?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (user.email.toLowerCase() || '').includes(search.toLowerCase())
    );

    const columns: Column<User>[] = [
        {
            key: 'displayName',
            header: 'Utilizador',
            sortable: true,
            render: (user) => (
                <div>
                    <div className="font-medium text-[hsl(var(--foreground))]">{user.displayName || 'Sem nome'}</div>
                    <div className="text-xs text-zinc-500">{user.email}</div>
                </div>
            ),
        },
        {
            key: 'role',
            header: 'Função',
            sortable: true,
            render: (user) => <RoleBadge role={user.role} size="sm" />,
        },
        {
            key: 'organizationId',
            header: 'Organização',
            sortable: true,
            render: (user) => (
                <span className="text-sm text-zinc-500">
                    {user.organizationId || '-'}
                </span>
            ),
        },
        {
            key: 'isActive',
            header: 'Estado',
            sortable: true,
            render: (user) => <StatusBadge status={user.isActive ? 'active' : 'suspended'} size="sm" />,
        },
        {
            key: 'lastLoginAt',
            header: 'Último Acesso',
            sortable: true,
            render: (user) => (
                <span className="text-sm text-zinc-500">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('pt-PT') : '-'}
                </span>
            )
        },
        {
            key: 'actions',
            header: '',
            width: '120px',
            render: (user) => (
                <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 hover:bg-background-tertiary rounded text-zinc-500 hover:text-brand-primary transition-colors" title="Editar">
                        <Edit size={16} />
                    </button>
                    {user.isActive ? (
                        <button
                            onClick={() => handleStatusChange(user.id, true)}
                            className="p-1.5 hover:bg-background-tertiary rounded text-zinc-500 hover:text-error transition-colors"
                            title="Suspender">
                            <Ban size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={() => handleStatusChange(user.id, false)}
                            className="p-1.5 hover:bg-background-tertiary rounded text-zinc-500 hover:text-success transition-colors"
                            title="Ativar">
                            <CheckCircle size={16} />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout title="Utilizadores" requireSuperAdmin>
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Gestão de Utilizadores</h2>
                        <p className="text-sm text-zinc-500">Gerir acesso e permissões de utilizadores</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleRefresh} className="btn btn-ghost" title="Atualizar">
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button className="btn btn-primary" onClick={() => alert('Coming soon!')}>
                            <Plus size={18} />
                            <span>Novo Utilizador</span>
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    searchPlaceholder="Pesquisar por nome ou email..."
                    onSearch={setSearch}
                    searchValue={search}
                    isLoading={loading}
                    serverSidePagination={{
                        currentPage: page,
                        hasNextPage: hasMore,
                        hasPrevPage: page > 1,
                        onNextPage: handleNextPage,
                        onPrevPage: handlePrevPage,
                        pageSize,
                        onPageSizeChange: (s) => {
                            setPageSize(s);
                            setPage(1);
                            setCursors({ 1: undefined });
                        }
                    }}
                />
            </div>
        </DashboardLayout>
    );
}
