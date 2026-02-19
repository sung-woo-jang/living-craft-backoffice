/**
 * Pieces Repository
 * IndexedDB cutting_pieces 테이블 CRUD
 */

import { openDatabase } from './db'
import { type CuttingPieceRecord } from './types'

class PiecesRepository {
  /**
   * 조각 일괄 추가 (sortOrder 자동 계산)
   */
  async addPieces(
    projectId: number,
    pieces: Array<{
      width: number
      height: number
      quantity: number
      label: string | null
      allowRotation: boolean
    }>
  ): Promise<CuttingPieceRecord[]> {
    const db = await openDatabase()
    const transaction = db.transaction(['cutting_pieces'], 'readwrite')
    const store = transaction.objectStore('cutting_pieces')

    // 현재 최대 sortOrder 조회
    const maxSortOrder = await this.getMaxSortOrder(store, projectId)

    const now = new Date().toISOString()
    const createdPieces: CuttingPieceRecord[] = []

    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i]
      const pieceRecord: Omit<CuttingPieceRecord, 'id'> = {
        projectId,
        width: piece.width,
        height: piece.height,
        quantity: piece.quantity,
        label: piece.label,
        sortOrder: maxSortOrder + i + 1,
        isCompleted: false,
        allowRotation: piece.allowRotation,
        fixedPosition: null,
        createdAt: now,
        updatedAt: now,
      }

      const id: number = await new Promise((resolve, reject) => {
        const request = store.add(pieceRecord)
        request.onsuccess = () => resolve(request.result as number)
        request.onerror = () => reject(request.error)
      })

      createdPieces.push({
        ...pieceRecord,
        id,
      })
    }

    return createdPieces
  }

  /**
   * 조각 수정
   */
  async updatePiece(
    projectId: number,
    pieceId: number,
    data: Partial<
      Pick<
        CuttingPieceRecord,
        'width' | 'height' | 'quantity' | 'label' | 'allowRotation'
      >
    >
  ): Promise<CuttingPieceRecord> {
    const db = await openDatabase()
    const transaction = db.transaction(['cutting_pieces'], 'readwrite')
    const store = transaction.objectStore('cutting_pieces')

    const existing: CuttingPieceRecord | undefined = await new Promise(
      (resolve, reject) => {
        const request = store.get(pieceId)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }
    )

    if (!existing) {
      throw new Error(`조각을 찾을 수 없습니다. (id: ${pieceId})`)
    }

    if (existing.projectId !== projectId) {
      throw new Error(`조각이 해당 프로젝트에 속하지 않습니다.`)
    }

    const updated: CuttingPieceRecord = {
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
   * 조각 삭제
   */
  async deletePiece(projectId: number, pieceId: number): Promise<void> {
    const db = await openDatabase()
    const transaction = db.transaction(['cutting_pieces'], 'readwrite')
    const store = transaction.objectStore('cutting_pieces')

    const existing: CuttingPieceRecord | undefined = await new Promise(
      (resolve, reject) => {
        const request = store.get(pieceId)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }
    )

    if (!existing) {
      throw new Error(`조각을 찾을 수 없습니다. (id: ${pieceId})`)
    }

    if (existing.projectId !== projectId) {
      throw new Error(`조각이 해당 프로젝트에 속하지 않습니다.`)
    }

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(pieceId)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 완료 상태 토글 (fixedPosition 관리)
   */
  async toggleComplete(
    projectId: number,
    pieceId: number,
    fixedPosition?: {
      x: number
      y: number
      width: number
      height: number
      rotated: boolean
    } | null
  ): Promise<CuttingPieceRecord> {
    const db = await openDatabase()
    const transaction = db.transaction(['cutting_pieces'], 'readwrite')
    const store = transaction.objectStore('cutting_pieces')

    const existing: CuttingPieceRecord | undefined = await new Promise(
      (resolve, reject) => {
        const request = store.get(pieceId)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }
    )

    if (!existing) {
      throw new Error(`조각을 찾을 수 없습니다. (id: ${pieceId})`)
    }

    if (existing.projectId !== projectId) {
      throw new Error(`조각이 해당 프로젝트에 속하지 않습니다.`)
    }

    const updated: CuttingPieceRecord = {
      ...existing,
      isCompleted: !existing.isCompleted,
      fixedPosition: !existing.isCompleted ? fixedPosition || null : null,
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
   * 특정 프로젝트의 최대 sortOrder 조회 (private)
   */
  private async getMaxSortOrder(
    store: IDBObjectStore,
    projectId: number
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const index = store.index('projectId')
      const request = index.getAll(projectId)
      request.onsuccess = () => {
        const pieces = request.result as CuttingPieceRecord[]
        if (pieces.length === 0) {
          resolve(0)
        } else {
          const maxOrder = Math.max(...pieces.map((p) => p.sortOrder))
          resolve(maxOrder)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }
}

export const piecesRepository = new PiecesRepository()
