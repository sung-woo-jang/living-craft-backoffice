import { type RouteObject } from 'react-router-dom'
import { Apps } from '@/pages/apps'
import { Chats } from '@/pages/chats'
import { HelpCenter } from '@/pages/help-center'
import { Tasks } from '@/pages/tasks'
import { Users } from '@/pages/users'

export const templateRoutes: RouteObject[] = [
  {
    path: 'apps',
    element: <Apps />,
  },
  {
    path: 'chats',
    element: <Chats />,
  },
  {
    path: 'tasks',
    element: <Tasks />,
  },
  {
    path: 'users',
    element: <Users />,
  },
  {
    path: 'help-center',
    element: <HelpCenter />,
  },
]
