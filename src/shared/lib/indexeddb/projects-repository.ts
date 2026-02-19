/**
 * Projects Repository
 * IndexedDB cutting_projects 테이블 CRUD
 */

import { openDatabase } from './db'
import {
  type CuttingProjectRecord,
  type CuttingProjectListItem,
  type CuttingProjectDetail,
  type FilmRecord,
  type CuttingPieceRecord,
} from './types'

class ProjectsRepository {
  /**
   * 프로젝트 목록 조회 (filmId 필터링 가능)
   */
  async findAll(filmId?: number): Promise<CuttingProjectListItem[]> {
    const db = await openDatabase()
    const transaction = db.transaction(
      ['cutting_projects', 'films', 'cutting_pieces'],
      'readonly'
    )
    const projectsStore = transaction.objectStore('cutting_projects')
    const filmsStore = transaction.objectStore('films')
    const piecesStore = transaction.objectStore('cutting_pieces')

    let projects: CuttingProjectRecord[]

    if (filmId !== undefined) {
      // filmId로 필터링
      const index = projectsStore.index('filmId')
      projects = await new Promise((resolve, reject) => {
        const request = index.getAll(filmId)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } else {
      // 전체 조회
      projects = await new Promise((resolve, reject) => {
        const request = projectsStore.getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    }

    // Film 정보 및 Piece 통계 조인
    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const film: FilmRecord | undefined = await new Promise((resolve, reject) => {
          const request = filmsStore.get(project.filmId)
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        })

        if (!film) {
          throw new Error(`필름지를 찾을 수 없습니다. (id: ${project.filmId})`)
        }

        const pieces = await this.findPiecesByProjectId(piecesStore, project.id)
        const pieceCount = pieces.length
        const completedPieceCount = pieces.filter((p) => p.isCompleted).length

        return {
          id: project.id,
          name: project.name,
          filmId: project.filmId,
          filmName: film.name,
          filmWidth: film.width,
          allowRotation: project.allowRotation,
          wastePercentage: project.wastePercentage,
          usedLength: project.usedLength,
          pieceCount,
          completedPieceCount,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        }
      })
    )

    return projectsWithDetails
  }

  /**
   * 프로젝트 상세 조회 (film 정보, pieces 포함)
   */
  async findById(id: number): Promise<CuttingProjectDetail | null> {
    const db = await openDatabase()
    const transaction = db.transaction(
      ['cutting_projects', 'films', 'cutting_pieces'],
      'readonly'
    )
    const projectsStore = transaction.objectStore('cutting_projects')
    const filmsStore = transaction.objectStore('films')
    const piecesStore = transaction.objectStore('cutting_pieces')

    const project: CuttingProjectRecord | undefined = await new Promise(
      (resolve, reject) => {
        const request = projectsStore.get(id)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }
    )

    if (!project) {
      return null
    }

    const film: FilmRecord | undefined = await new Promise((resolve, reject) => {
      const request = filmsStore.get(project.filmId)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    if (!film) {
      throw new Error(`필름지를 찾을 수 없습니다. (id: ${project.filmId})`)
    }

    const pieces = await this.findPiecesByProjectId(piecesStore, id)

    return {
      id: project.id,
      name: project.name,
      allowRotation: project.allowRotation,
      wastePercentage: project.wastePercentage,
      usedLength: project.usedLength,
      packingResult: project.packingResult,
      film: {
        id: film.id,
        name: film.name,
        width: film.width,
        length: film.length,
      },
      pieces,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }
  }

  /**
   * 프로젝트 생성 (pieces 동시 생성)
   */
  async create(data: {
    name: string
    filmId: number
    allowRotation: boolean
    pieces?: Array<{
      width: number
      height: number
      quantity: number
      label: string | null
      allowRotation: boolean
    }>
  }): Promise<CuttingProjectRecord> {
    const db = await openDatabase()
    const transaction = db.transaction(
      ['cutting_projects', 'cutting_pieces'],
      'readwrite'
    )
    const projectsStore = transaction.objectStore('cutting_projects')
    const piecesStore = transaction.objectStore('cutting_pieces')

    const now = new Date().toISOString()
    const projectRecord: Omit<CuttingProjectRecord, 'id'> = {
      name: data.name,
      filmId: data.filmId,
      allowRotation: data.allowRotation,
      wastePercentage: null,
      usedLength: null,
      packingResult: null,
      createdAt: now,
      updatedAt: now,
    }

    const projectId: number = await new Promise((resolve, reject) => {
      const request = projectsStore.add(projectRecord)
      request.onsuccess = () => resolve(request.result as number)
      request.onerror = () => reject(request.error)
    })

    // Pieces 동시 생성
    if (data.pieces && data.pieces.length > 0) {
      for (let i = 0; i < data.pieces.length; i++) {
        const piece = data.pieces[i]
        const pieceRecord: Omit<CuttingPieceRecord, 'id'> = {
          projectId,
          width: piece.width,
          height: piece.height,
          quantity: piece.quantity,
          label: piece.label,
          sortOrder: i + 1,
          isCompleted: false,
          allowRotation: piece.allowRotation,
          fixedPosition: null,
          createdAt: now,
          updatedAt: now,
        }
        await new Promise<void>((resolve, reject) => {
          const request = piecesStore.add(pieceRecord)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      }
    }

    return {
      ...projectRecord,
      id: projectId,
    }
  }

  /**
   * 프로젝트 수정
   */
  async update(
    id: number,
    data: Partial<Omit<CuttingProjectRecord, 'id' | 'filmId' | 'createdAt' | 'updatedAt'>>
  ): Promise<CuttingProjectRecord> {
    const db = await openDatabase()
    const transaction = db.transaction(['cutting_projects'], 'readwrite')
    const store = transaction.objectStore('cutting_projects')

    const existing: CuttingProjectRecord | undefined = await new Promise(
      (resolve, reject) => {
        const request = store.get(id)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }
    )

    if (!existing) {
      throw new Error(`프로젝트를 찾을 수 없습니다. (id: ${id})`)
    }

    const updated: CuttingProjectRecord = {
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
   * 프로젝트 삭제 (연관 pieces 함께 삭제 - Cascade)
   */
  async delete(id: number): Promise<void> {
    const db = await openDatabase()
    const transaction = db.transaction(
      ['cutting_projects', 'cutting_pieces'],
      'readwrite'
    )
    const projectsStore = transaction.objectStore('cutting_projects')
    const piecesStore = transaction.objectStore('cutting_pieces')

    // Pieces 삭제
    const pieces = await this.findPiecesByProjectId(piecesStore, id)
    for (const piece of pieces) {
      await new Promise<void>((resolve, reject) => {
        const request = piecesStore.delete(piece.id)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }

    // Project 삭제
    await new Promise<void>((resolve, reject) => {
      const request = projectsStore.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 특정 프로젝트의 Piece 목록 조회 (private)
   */
  private async findPiecesByProjectId(
    piecesStore: IDBObjectStore,
    projectId: number
  ): Promise<CuttingPieceRecord[]> {
    return new Promise((resolve, reject) => {
      const index = piecesStore.index('projectId')
      const request = index.getAll(projectId)
      request.onsuccess = () => {
        const pieces = request.result as CuttingPieceRecord[]
        // sortOrder로 정렬
        pieces.sort((a, b) => a.sortOrder - b.sortOrder)
        resolve(pieces)
      }
      request.onerror = () => reject(request.error)
    })
  }
}

export const projectsRepository = new ProjectsRepository()
