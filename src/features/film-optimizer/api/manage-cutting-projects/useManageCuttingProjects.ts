import { useQueryClient } from '@tanstack/react-query'
import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import { toast } from 'sonner'
import type {
  CuttingProjectDetail,
  CuttingPiece,
} from '../fetch-cutting-projects'
import { cuttingProjectsKeys } from '../query-keys'
import type {
  CreateCuttingProjectRequest,
  UpdateCuttingProjectVariables,
  AddPiecesVariables,
  UpdatePieceVariables,
  PieceActionVariables,
} from './types'

// ===== 프로젝트 관련 API =====

const createCuttingProject = async (
  request: CreateCuttingProjectRequest
): Promise<ApiResponse<CuttingProjectDetail>> => {
  const { data } = await axiosInstance.post<CuttingProjectDetail>(
    ADMIN_API.FILM_OPTIMIZER.PROJECTS.CREATE,
    request
  )
  return data
}

const updateCuttingProject = async ({
  id,
  data: requestData,
}: UpdateCuttingProjectVariables): Promise<
  ApiResponse<CuttingProjectDetail>
> => {
  const { data } = await axiosInstance.post<CuttingProjectDetail>(
    ADMIN_API.FILM_OPTIMIZER.PROJECTS.UPDATE(id),
    requestData
  )
  return data
}

const deleteCuttingProject = async (
  id: number | string
): Promise<ApiResponse<void>> => {
  const { data } = await axiosInstance.post<void>(
    ADMIN_API.FILM_OPTIMIZER.PROJECTS.DELETE(id)
  )
  return data
}

// ===== 조각 관련 API =====

const addPieces = async ({
  projectId,
  data: requestData,
}: AddPiecesVariables): Promise<ApiResponse<CuttingPiece[]>> => {
  const { data } = await axiosInstance.post<CuttingPiece[]>(
    ADMIN_API.FILM_OPTIMIZER.PIECES.ADD(projectId),
    requestData
  )
  return data
}

const updatePiece = async ({
  projectId,
  pieceId,
  data: requestData,
}: UpdatePieceVariables): Promise<ApiResponse<CuttingPiece>> => {
  const { data } = await axiosInstance.post<CuttingPiece>(
    ADMIN_API.FILM_OPTIMIZER.PIECES.UPDATE(projectId, pieceId),
    requestData
  )
  return data
}

const deletePiece = async ({
  projectId,
  pieceId,
}: PieceActionVariables): Promise<ApiResponse<void>> => {
  const { data } = await axiosInstance.post<void>(
    ADMIN_API.FILM_OPTIMIZER.PIECES.DELETE(projectId, pieceId)
  )
  return data
}

const togglePieceComplete = async ({
  projectId,
  pieceId,
}: PieceActionVariables): Promise<ApiResponse<CuttingPiece>> => {
  const { data } = await axiosInstance.post<CuttingPiece>(
    ADMIN_API.FILM_OPTIMIZER.PIECES.TOGGLE_COMPLETE(projectId, pieceId)
  )
  return data
}

// ===== 프로젝트 Mutation Hooks =====

export function useCreateCuttingProject() {
  const queryClient = useQueryClient()

  return useStandardMutation<
    CuttingProjectDetail,
    Error,
    CreateCuttingProjectRequest
  >({
    mutationFn: createCuttingProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...cuttingProjectsKeys.all()],
      })
      toast.success('재단 프로젝트가 생성되었습니다.')
    },
  })
}

export function useUpdateCuttingProject() {
  const queryClient = useQueryClient()

  return useStandardMutation<
    CuttingProjectDetail,
    Error,
    UpdateCuttingProjectVariables
  >({
    mutationFn: updateCuttingProject,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...cuttingProjectsKeys.all()],
      })
      queryClient.invalidateQueries({
        queryKey: [...cuttingProjectsKeys.detail(variables.id)],
      })
      toast.success('재단 프로젝트가 수정되었습니다.')
    },
  })
}

export function useDeleteCuttingProject() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, number | string>({
    mutationFn: deleteCuttingProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...cuttingProjectsKeys.all()],
      })
      toast.success('재단 프로젝트가 삭제되었습니다.')
    },
  })
}

// ===== 조각 Mutation Hooks =====

export function useAddPieces() {
  const queryClient = useQueryClient()

  return useStandardMutation<CuttingPiece[], Error, AddPiecesVariables>({
    mutationFn: addPieces,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...cuttingProjectsKeys.detail(variables.projectId)],
      })
      toast.success('재단 조각이 추가되었습니다.')
    },
  })
}

export function useUpdatePiece() {
  const queryClient = useQueryClient()

  return useStandardMutation<CuttingPiece, Error, UpdatePieceVariables>({
    mutationFn: updatePiece,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...cuttingProjectsKeys.detail(variables.projectId)],
      })
      toast.success('재단 조각이 수정되었습니다.')
    },
  })
}

export function useDeletePiece() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, PieceActionVariables>({
    mutationFn: deletePiece,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...cuttingProjectsKeys.detail(variables.projectId)],
      })
      toast.success('재단 조각이 삭제되었습니다.')
    },
  })
}

export function useTogglePieceComplete() {
  const queryClient = useQueryClient()

  return useStandardMutation<CuttingPiece, Error, PieceActionVariables>({
    mutationFn: togglePieceComplete,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...cuttingProjectsKeys.detail(variables.projectId)],
      })
    },
  })
}
