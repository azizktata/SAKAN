import { EspaceClientSidebar } from '@/components/espace-client/sidebar'

// Round 2: add auth() check here → redirect to /auth if not logged in

export default function EspaceClientLayout({ children }: { children: React.ReactNode }) {
  // Mock user — replace with session from auth() in Round 2
  const mockUser = { name: 'Ahmed Ben Ali', image: null }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <EspaceClientSidebar userName={mockUser.name} userImage={mockUser.image} />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}
