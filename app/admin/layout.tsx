import { AdminSidebar } from '@/components/admin/admin-sidebar'

// Round 2: add auth() check here — redirect non-ADMIN users

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}
