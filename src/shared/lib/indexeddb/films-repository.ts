/**
 * Films Repository
 * IndexedDB films 테이블 CRUD
 */

import { openDatabase } from './db'
import { type FilmRecord, type FilmListItem } from './types'

class FilmsRepository {
  /**
   * 필름지 목록 조회 (projectCount 포함)
   */
  async findAll(): Promise<FilmListItem[]> {
    const db = await openDatabase()
    const transaction = db.transaction(['films', 'cutting_projects'], 'readonly')
    const filmsStore = transaction.objectStore('films')
    const projectsStore = transaction.objectStore('cutting_projects')

    const films: FilmRecord[] = await new Promise((resolve, reject) => {
      const request = filmsStore.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    // 각 필름의 프로젝트 개수 계산
    const filmsWithCount = await Promise.all(
      films.map(async (film) => {
        const projectCount = await this.countProjectsByFilmId(
          projectsStore,
          film.id
        )
        return {
          ...film,
          projectCount,
        }
      })
    )

    return filmsWithCount
  }

  /**
   * 필름지 상세 조회
   */
  async findById(id: number): Promise<FilmListItem | null> {
    const db = await openDatabase()
    const transaction = db.transaction(['films', 'cutting_projects'], 'readonly')
    const filmsStore = transaction.objectStore('films')
    const projectsStore = transaction.objectStore('cutting_projects')

    const film: FilmRecord | undefined = await new Promise((resolve, reject) => {
      const request = filmsStore.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    if (!film) {
      return null
    }

    const projectCount = await this.countProjectsByFilmId(projectsStore, id)

    return {
      ...film,
      projectCount,
    }
  }

  /**
   * 필름지 생성
   */
  async create(data: Omit<FilmRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<FilmRecord> {
    const db = await openDatabase()
    const transaction = db.transaction(['films'], 'readwrite')
    const store = transaction.objectStore('films')

    const now = new Date().toISOString()
    const record: Omit<FilmRecord, 'id'> = {
      ...data,
      createdAt: now,
      updatedAt: now,
    }

    const id: number = await new Promise((resolve, reject) => {
      const request = store.add(record)
      request.onsuccess = () => resolve(request.result as number)
      request.onerror = () => reject(request.error)
    })

    return {
      ...record,
      id,
    }
  }

  /**
   * 필름지 수정
   */
  async update(
    id: number,
    data: Partial<Omit<FilmRecord, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<FilmRecord> {
    const db = await openDatabase()
    const transaction = db.transaction(['films'], 'readwrite')
    const store = transaction.objectStore('films')

    const existing: FilmRecord | undefined = await new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    if (!existing) {
      throw new Error(`필름지를 찾을 수 없습니다. (id: ${id})`)
    }

    const updated: FilmRecord = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    await new Promise<void>((resolve, reject) => {
      const request = store.put(updated)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    return updated
  }

  /**
   * 필름지 삭제 (연관 프로젝트 확인)
   */
  async delete(id: number): Promise<void> {
    const db = await openDatabase()
    const transaction = db.transaction(['films', 'cutting_projects'], 'readwrite')
    const filmsStore = transaction.objectStore('films')
    const projectsStore = transaction.objectStore('cutting_projects')

    // 연관 프로젝트 확인
    const projectCount = await this.countProjectsByFilmId(projectsStore, id)
    if (projectCount > 0) {
      throw new Error(
        `이 필름지를 사용하는 프로젝트가 ${projectCount}개 있습니다. 먼저 프로젝트를 삭제해주세요.`
      )
    }

    await new Promise<void>((resolve, reject) => {
      const request = filmsStore.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 특정 필름의 프로젝트 개수 조회 (private)
   */
  private async countProjectsByFilmId(
    projectsStore: IDBObjectStore,
    filmId: number
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const index = projectsStore.index('filmId')
      const request = index.count(filmId)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}

export const filmsRepository = new FilmsRepository()
