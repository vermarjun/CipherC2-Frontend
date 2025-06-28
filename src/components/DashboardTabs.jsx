import { NavLink } from 'react-router-dom';
import { Terminal, Users, Settings, Shield, Monitor } from 'lucide-react';

export default function DashboardTabs() {
  const tabs = [
    {
      name: 'Sessions',
      href: '/dashboard/sessions',
      icon: Terminal,
    },
    {
      name: 'Victim Devices',
      href: '/dashboard/victims',
      icon: Monitor,
    },
    {
      name: 'Operators',
      href: '/dashboard/operators',
      icon: Users,
    },
    {
      name: 'Operations',
      href: '/dashboard/operations',
      icon: Settings,
    },
    {
      name: 'Access',
      href: '/dashboard/access',
      icon: Shield,
    },
  ];

  return (
    <div className="border-b border-neutral-800">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.name}
              to={tab.href}
              className={({ isActive }) =>
                `group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-neutral-400 hover:text-neutral-300 hover:border-neutral-700'
                }`
              }
            >
              <Icon
                className={`-ml-0.5 mr-2 h-5 w-5 ${
                  location.pathname === tab.href
                    ? 'text-blue-400'
                    : 'text-neutral-400 group-hover:text-neutral-300'
                }`}
                aria-hidden="true"
              />
              {tab.name}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
} 