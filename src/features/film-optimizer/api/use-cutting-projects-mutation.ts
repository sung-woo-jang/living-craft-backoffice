import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import type {
  AddPiecesRequest,
  CreateCuttingProjectRequest,
  CuttingPiece,
  CuttingProjectDetail,
  UpdateCuttingProjectRequest,
  UpdatePieceRequest,
} from '@/shared/types/api'

/**
 * 재단 프로젝트 생성
 * POST /api/admin/film-optimizer/projects
 */
export function useCreateCuttingProject() {
  const queryClient = useQueryClient()

  return useStandardMutation<
    CuttingProjectDetail,
    Error,
    CreateCuttingProjectRequest
  >({
    mutationFn: async (requestData) => {
      const { data } = await axiosInstance.post<CuttingProjectDetail>(
        ADMIN_API.FILM_OPTIMIZER.PROJECTS.CREATE,
        requestData
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKeysFromUrl(
          ADMIN_API.FILM_OPTIMIZER.PROJECTS.LIST
        ),
      })
      toast.success('재단 프로젝트가 생성되었습니다.')
    },
  })
}

/**
 * 재단 프로젝트 수정
 * POST /api/admin/film-optimizer/projects/:id/update
 */
export function useUpdateCuttingProject() {
  const queryClient = useQueryClient()

  return useStandardMutation<
    CuttingProjectDetail,
    Error,
    { id: number | string; data: UpdateCuttingProjectRequest }
  >({
    mutationFn: async ({ id, data: requestData }) => {
      const { data } = await axiosInstance.post<CuttingProjectDetail>(
        ADMIN_API.FILM_OPTIMIZER.PROJECTS.UPDATE(id),
        requestData
      )
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKeysFromUrl(
          ADMIN_API.FILM_OPTIMIZER.PROJECTS.LIST
        ),
      })
      queryClient.invalidateQueries({
        queryKey: [
          'admin',
          'film-optimizer',
          'projects',
          'detail',
          variables.id,
        ],
      })
      toast.success('재단 프로젝트가 수정되었습니다.')
    },
  })
}

/**
 * 재단 프로젝트 삭제
 * POST /api/admin/film-optimizer/projects/:id/delete
 */
export function useDeleteCuttingProject() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, number | string>({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.post<void>(
        ADMIN_API.FILM_OPTIMIZER.PROJECTS.DELETE(id)
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKeysFromUrl(
          ADMIN_API.FILM_OPTIMIZER.PROJECTS.LIST
        ),
      })
      toast.success('재단 프로젝트가 삭제되었습니다.')
    },
  })
}

/**
 * 재단 조각 추가
 * POST /api/admin/film-optimizer/projects/:projectId/pieces
 */
export function useAddPieces() {
  const queryClient = useQueryClient()

  return useStandardMutation<
    CuttingPiece[],
    Error,
    { projectId: number | string; data: AddPiecesRequest }
  >({
    mutationFn: async ({ projectId, data: requestData }) => {
      const { data } = await axiosInstance.post<CuttingPiece[]>(
        ADMIN_API.FILM_OPTIMIZER.PIECES.ADD(projectId),
        requestData
      )
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'admin',
          'film-optimizer',
          'projects',
          'detail',
          variables.projectId,
        ],
      })
      toast.success('재단 조각이 추가되었습니다.')
    },
  })
}

/**
 * 재단 조각 수정
 * POST /api/admin/film-optimizer/projects/:projectId/pieces/:pieceId/update
 */
export function useUpdatePiece() {
  const queryClient = useQueryClient()

  return useStandardMutation<
    CuttingPiece,
    Error,
    {
      projectId: number | string
      pieceId: number | string
      data: UpdatePieceRequest
    }
  >({
    mutationFn: async ({ projectId, pieceId, data: requestData }) => {
      const { data } = await axiosInstance.post<CuttingPiece>(
        ADMIN_API.FILM_OPTIMIZER.PIECES.UPDATE(projectId, pieceId),
        requestData
      )
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'admin',
          'film-optimizer',
          'projects',
          'detail',
          variables.projectId,
        ],
      })
      toast.success('재단 조각이 수정되었습니다.')
    },
  })
}

/**
 * 재단 조각 삭제
 * POST /api/admin/film-optimizer/projects/:projectId/pieces/:pieceId/delete
 */
export function useDeletePiece() {
  const queryClient = useQueryClient()

  return useStandardMutation<
    void,
    Error,
    { projectId: number | string; pieceId: number | string }
  >({
    mutationFn: async ({ projectId, pieceId }) => {
      const { data } = await axiosInstance.post<void>(
        ADMIN_API.FILM_OPTIMIZER.PIECES.DELETE(projectId, pieceId)
      )
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'admin',
          'film-optimizer',
          'projects',
          'detail',
          variables.projectId,
        ],
      })
      toast.success('재단 조각이 삭제되었습니다.')
    },
  })
}

/**
 * 재단 조각 완료 토글
 * POST /api/admin/film-optimizer/projects/:projectId/pieces/:pieceId/toggle-complete
 */
export function useTogglePieceComplete() {
  const queryClient = useQueryClient()

  return useStandardMutation<
    CuttingPiece,
    Error,
    { projectId: number | string; pieceId: number | string }
  >({
    mutationFn: async ({ projectId, pieceId }) => {
      const { data } = await axiosInstance.post<CuttingPiece>(
        ADMIN_API.FILM_OPTIMIZER.PIECES.TOGGLE_COMPLETE(projectId, pieceId)
      )
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'admin',
          'film-optimizer',
          'projects',
          'detail',
          variables.projectId,
        ],
      })
    },
  })
}
