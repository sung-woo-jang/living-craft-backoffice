/**
 * IndexedDB 초기화 및 스키마 정의
 */

const DB_NAME = 'film-cutting-db'
const DB_VERSION = 1

export async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('IndexedDB를 열 수 없습니다.'))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Films Object Store
      if (!db.objectStoreNames.contains('films')) {
        const filmsStore = db.createObjectStore('films', {
          keyPath: 'id',
          autoIncrement: true,
        })
        filmsStore.createIndex('name', 'name', { unique: false })
        filmsStore.createIndex('isActive', 'isActive', { unique: false })
      }

      // Cutting Projects Object Store
      if (!db.objectStoreNames.contains('cutting_projects')) {
        const projectsStore = db.createObjectStore('cutting_projects', {
          keyPath: 'id',
          autoIncrement: true,
        })
        projectsStore.createIndex('filmId', 'filmId', { unique: false })
        projectsStore.createIndex('name', 'name', { unique: false })
        projectsStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // Cutting Pieces Object Store
      if (!db.objectStoreNames.contains('cutting_pieces')) {
        const piecesStore = db.createObjectStore('cutting_pieces', {
          keyPath: 'id',
          autoIncrement: true,
        })
        piecesStore.createIndex('projectId', 'projectId', { unique: false })
        piecesStore.createIndex('sortOrder', 'sortOrder', { unique: false })
        piecesStore.createIndex('isCompleted', 'isCompleted', {
          unique: false,
        })
        piecesStore.createIndex('projectId_sortOrder', ['projectId', 'sortOrder'], {
          unique: false,
        })
      }
    }
  })
}

/**
 * 빈 데이터베이스 초기화
 * 초기 데이터 없이 스키마만 생성
 */
export async function seedDatabase(): Promise<void> {
  // 스키마만 생성하고 초기 데이터는 삽입하지 않음
  await openDatabase()
}
