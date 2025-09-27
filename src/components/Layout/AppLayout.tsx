import { useState, ReactNode } from 'react';
import { Menu, X, FileJson, Layers, History, Settings, ChevronLeft, Github, Twitter } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  activeView: 'input' | 'history' | 'settings';
  onViewChange: (view: 'input' | 'history' | 'settings') => void;
}

export function AppLayout({ children, activeView, onViewChange }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = [
    { id: 'input', label: 'Input', icon: FileJson, description: 'Add GeoJSON data' },
    { id: 'history', label: 'History', icon: History, description: 'Recent files' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Preferences' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 from-gray-900 to-gray-950">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white/80 bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 border-gray-800">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 hover:bg-gray-800 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileJson className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-white">GeoCompact</span>
          </div>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)] lg:h-screen">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "hidden lg:flex flex-col bg-white bg-gray-900 border-r border-gray-200 border-gray-800 transition-all duration-300",
            sidebarCollapsed ? "w-20" : "w-64"
          )}
        >
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileJson className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="font-bold text-lg text-gray-900">GeoCompact</h1>
                  <p className="text-xs text-gray-500">Compress GeoJSON</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id as any)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    "hover:bg-gray-100 hover:bg-gray-800",
                    isActive && "bg-purple-50 bg-purple-900/20 text-purple-600 text-purple-400",
                    !isActive && "text-gray-700 text-gray-300"
                  )}
                >
                  <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-purple-600 text-purple-400")} />
                  {!sidebarCollapsed && (
                    <div className="text-left">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs opacity-60">{item.description}</div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Collapse Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 hover:bg-gray-800 transition-colors text-gray-600 text-gray-400"
            >
              <ChevronLeft className={cn("w-4 h-4 transition-transform", sidebarCollapsed && "rotate-180")} />
              {!sidebarCollapsed && <span className="text-sm">Collapse</span>}
            </button>
          </div>

          {/* Footer Links */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-center gap-4">
                <a href="https://github.com" className="text-gray-400 hover:text-gray-600 hover:text-gray-300 transition-colors">
                  <Github className="w-4 h-4" />
                </a>
                <a href="https://twitter.com" className="text-gray-400 hover:text-gray-600 hover:text-gray-300 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Sidebar */}
        <div
          className={cn(
            "lg:hidden fixed inset-0 z-40 transition-opacity duration-300",
            sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white bg-gray-900 shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileJson className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-gray-900">GeoCompact</h1>
                  <p className="text-xs text-gray-500">Compress GeoJSON</p>
                </div>
              </div>
            </div>

            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id as any);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                      "hover:bg-gray-100 hover:bg-gray-800",
                      isActive && "bg-purple-50 bg-purple-900/20 text-purple-600 text-purple-400",
                      !isActive && "text-gray-700 text-gray-300"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive && "text-purple-600 text-purple-400")} />
                    <div className="text-left">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs opacity-60">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}