import { EspaceClientSidebar, MobileBottomNav } from '@/components/espace-client/sidebar'

export default function EspaceClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <EspaceClientSidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {children}
      </div>
      <MobileBottomNav />
    </div>
  )
}
