import { ConfigDrawer } from '@/shared/ui-kit/config-drawer'
import { Header, Main } from '@/widgets/header'
import { ProfileDropdown } from '@/shared/ui-kit/profile-dropdown'
import { Search } from '@/shared/ui-kit/search'
import { ThemeSwitch } from '@/shared/ui-kit/theme-switch'
import { UsersDialogs } from '@/features/users/ui/users-dialogs'
import { UsersPrimaryButtons } from '@/features/users/ui/users-primary-buttons'
import { UsersProvider } from '@/features/users/ui/users-provider'
import { UsersTable } from '@/features/users/ui/users-table'
import { mockUsers as users } from '@/entities/user'

export function Users() {

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <UsersTable data={users} />
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
