/**
 * Film Optimizer Local API (IndexedDB)
 */

// Films
export { useFetchFilms, useFetchFilmDetail } from './fetch-films'
export { useCreateFilm, useUpdateFilm, useDeleteFilm } from './manage-films'

// Cutting Projects
export {
  useFetchCuttingProjects,
  useFetchCuttingProjectDetail,
} from './fetch-cutting-projects'
export {
  useCreateCuttingProject,
  useUpdateCuttingProject,
  useDeleteCuttingProject,
  useAddPieces,
  useUpdatePiece,
  useDeletePiece,
  useTogglePieceComplete,
} from './manage-cutting-projects'
