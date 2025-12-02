import { mockTasks as tasks } from '@/entities/task'
import { ConfigDrawer } from '@/shared/ui-kit/config-drawer'
import { ProfileDropdown } from '@/shared/ui-kit/profile-dropdown'
import { Search } from '@/shared/ui-kit/search'
import { ThemeSwitch } from '@/shared/ui-kit/theme-switch'
import { Header, Main } from '@/widgets/header'
import { TasksDialogs } from '@/features/tasks/ui/tasks-dialogs'
import { TasksPrimaryButtons } from '@/features/tasks/ui/tasks-primary-buttons'
import { TasksTable } from '@/features/tasks/ui/tasks-table'

export function Tasks() {
  return (
    <>
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
            <h2 className='text-2xl font-bold tracking-tight'>Tasks</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <TasksPrimaryButtons />
        </div>
        <TasksTable data={tasks} />
      </Main>

      <TasksDialogs />
    </>
  )
}
