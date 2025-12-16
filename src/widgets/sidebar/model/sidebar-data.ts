import { type SidebarData } from '@/shared/types/sidebar'
import {
  LayoutDashboard,
  ListTodo,
  Package,
  Palette,
  Settings,
  Users,
  MessagesSquare,
  Command,
  Calendar,
  Briefcase,
  Image,
  Star,
  UserCircle,
  Clock,
  Scissors,
} from 'lucide-react'

export const sidebarData: SidebarData = {
  user: {
    name: 'Living Craft Admin',
    email: 'admin@livingcraft.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Living Craft',
      logo: Command,
      plan: '관리자 백오피스',
    },
  ],
  navGroups: [
    {
      title: 'Living Craft 관리',
      items: [
        {
          title: '대시보드',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: '예약 관리',
          url: '/reservations',
          icon: Calendar,
        },
        {
          title: '서비스 관리',
          url: '/services',
          icon: Briefcase,
        },
        {
          title: '포트폴리오 관리',
          url: '/portfolios',
          icon: Image,
        },
        {
          title: '리뷰 관리',
          url: '/reviews',
          icon: Star,
        },
        {
          title: '고객 관리',
          url: '/customers',
          icon: UserCircle,
        },
        {
          title: '필름 재단',
          url: '/film-cutting',
          icon: Scissors,
        },
      ],
    },
    {
      title: '설정',
      items: [
        {
          title: '운영 설정',
          icon: Settings,
          items: [
            {
              title: '운영 시간',
              url: '/settings/operating',
              icon: Clock,
            },
            {
              title: '외관',
              url: '/settings/appearance',
              icon: Palette,
            },
          ],
        },
      ],
    },
    {
      title: '템플릿 (참고용)',
      items: [
        {
          title: 'Tasks',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'Apps',
          url: '/apps',
          icon: Package,
        },
        {
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: MessagesSquare,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
      ],
    },
  ],
}
