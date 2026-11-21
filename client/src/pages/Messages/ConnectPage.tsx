// client/src/pages/Connect/ConnectPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../features/api/api';
import MessageButton from '../../components/MessageButton';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DiscoverUser {
    id: string;
    name: string;
    username: string | null;
    avatar: string | null;
    bio: string | null;
    startupName: string | null;

    messagePolicy: 'ANYONE' | 'CONNECTIONS_ONLY';
    connectionStatus: 'NONE' | 'PENDING' | 'ACCEPTED';
}

const CONTAINER = 'mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8';

function UserCardSkeleton() {
    return (
        <div className="animate-pulse rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-secondary" />
                <div className="h-3.5 w-28 rounded bg-secondary" />
                <div className="h-3 w-40 rounded bg-secondary" />
                <div className="mt-2 h-8 w-full rounded-lg bg-secondary" />
            </div>
        </div>
    );
}

export default function ConnectPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<DiscoverUser[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const isAuthenticated = !!user;

    const loadUsers = useCallback(async (pageNum: number, searchTerm: string) => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/users/discover', {
                params: { page: pageNum, limit: 20, search: searchTerm },
            });
            setUsers(data.users);
            setTotalPages(data.pagination.totalPages);
        } catch (err) {
            console.error('Failed to load users', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            loadUsers(1, search);
        }, 350); // debounce search input
        return () => clearTimeout(timer);
    }, [search, loadUsers]);

    useEffect(() => {
        if (page > 1) loadUsers(page, search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    return (
        <div className="min-h-full bg-background text-foreground">

            <main className={`${CONTAINER} pb-16`}>
                {/* ---------------- Header ---------------- */}
                <header className="mb-8 sm:mb-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        Discover people
                    </div>

                    <h1 className="mt-5 text-[28px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[36px]">
                        Connect with founders
                    </h1>

                    <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                        Find founders, builders, and members of the community. Send a message and start a conversation.
                    </p>
                </header>

                {/* ---------------- Search ---------------- */}
                <div className="relative mb-8">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or username..."
                        aria-label="Search people"
                        className="h-12 w-full rounded-lg border border-border bg-card pl-11 pr-4 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* ---------------- Results ---------------- */}
                {loading && page === 1 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <UserCardSkeleton key={i} />
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Users className="h-5 w-5" />
                        </div>
                        <p className="text-[16px] font-semibold">No members found</p>
                        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
                            {search
                                ? `No one matched "${search}". Try a different name or username.`
                                : 'No members to show yet. Check back soon.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {users.map((u) => (
                            <article
                                key={u.id}
                                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_8px_24px_-12px_rgba(17,35,79,0.15)]"
                            >
                                <button
                                    type="button"
                                    onClick={() => navigate(`/profile/${u.id}`)}
                                    className="flex w-full flex-col items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                >
                                    <Avatar className="h-16 w-16 rounded-full ring-1 ring-border">
                                        <AvatarImage src={u.avatar || ''} alt={u.name} />
                                        <AvatarFallback className="bg-secondary text-[18px] font-semibold text-muted-foreground">
                                            {u.name?.[0] || 'U'}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="min-w-0">
                                        <p className="truncate text-[15px] font-semibold leading-tight">
                                            {u.name}
                                        </p>

                                        {u.bio && (
                                            <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                                                {u.bio}
                                            </p>
                                        )}

                                        {u.startupName && (
                                            <p className="mt-2 text-[12px] text-muted-foreground">
                                                Founder of{' '}
                                                <span className="font-semibold text-foreground">
                                                    {u.startupName}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </button>

                                <div className="mt-auto flex w-full items-center justify-center pt-1">
                                    {isAuthenticated ? (
                                        <MessageButton
                                            targetUser={{
                                                id: u.id,
                                                name: u.name,
                                                avatar: u.avatar,
                                                messagePolicy: u.messagePolicy,
                                            }}
                                            connectionStatus={u.connectionStatus}
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => navigate('/login')}
                                            className="h-9 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                        >
                                            Connect
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* ---------------- Pagination ---------------- */}
                {totalPages > 1 && (
                    <nav
                        aria-label="Pagination"
                        className="mt-10 flex items-center justify-center gap-3"
                    >
                        <button
                            type="button"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </button>

                        <span className="text-[13px] text-muted-foreground">
                            Page <span className="font-semibold text-foreground">{page}</span> of {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={page === totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </nav>
                )}
            </main>
        </div>
    );
}