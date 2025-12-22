import { FilmCuttingFormHeader } from '../film-cutting-form-header'
import { FilmCuttingFormSettings } from '../film-cutting-form-settings'
import { FilmCuttingFormPieces } from '../film-cutting-form-pieces'
import { FilmCuttingFormVisualization } from '../film-cutting-form-visualization'
import styles from './styles.module.scss'

/**
 * 필름 재단 폼 메인 콘텐츠
 */
export function FilmCuttingFormContent() {
  return (
    <div className={styles.page}>
      <FilmCuttingFormHeader />

      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <FilmCuttingFormSettings />
          <FilmCuttingFormPieces />
        </div>

        <div className={styles.rightPanel}>
          <FilmCuttingFormVisualization />
        </div>
      </div>
    </div>
  )
}
