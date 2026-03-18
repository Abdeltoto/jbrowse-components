import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes/models'
import { lazyInit, types } from '@jbrowse/mobx-state-tree'

import ImportWizard from './ImportWizard.ts'
import Spreadsheet from './SpreadsheetModel.tsx'

import type { enhance } from './SpreadsheetViewModel.lazy.ts'
import type { Instance } from '@jbrowse/mobx-state-tree'

export interface SpreadsheetViewInit {
  assembly: string
  uri: string
  fileType?: string
}

const defaultHeight = 440

/**
 * #stateModel SpreadsheetView
 * #category view
 */
function x() {} // eslint-disable-line @typescript-eslint/no-unused-vars

const ImportWizardModel = ImportWizard()

export function createBaseModel() {
  return types.compose(
    BaseViewModel,
    types.model('SpreadsheetView', {
      /**
       * #property
       */
      type: types.literal('SpreadsheetView'),
      /**
       * #property
       */
      offsetPx: 0,
      /**
       * #property
       */
      height: types.optional(types.number, defaultHeight),
      /**
       * #property
       */
      hideVerticalResizeHandle: false,
      /**
       * #property
       */
      hideFilterControls: false,

      /**
       * #property
       */
      importWizard: types.optional(ImportWizardModel, () =>
        ImportWizardModel.create(),
      ),
      /**
       * #property
       */
      spreadsheet: types.maybe(Spreadsheet()),
      /**
       * #property
       * used for initializing the view from a session snapshot
       */
      init: types.frozen<SpreadsheetViewInit | undefined>(),
    }),
  )
}

export type SpreadsheetViewBaseModel = ReturnType<typeof createBaseModel>

export default function stateModelFactory() {
  return lazyInit(
    createBaseModel(),
    () => import('./SpreadsheetViewModel.lazy.ts').then(m => m.enhance),
  ) as ReturnType<typeof enhance> & { preload(): Promise<void> }
}

export type SpreadsheetViewStateModel = ReturnType<typeof stateModelFactory>
export type SpreadsheetViewModel = Instance<SpreadsheetViewStateModel>
