import { getSession } from '@jbrowse/core/util'
import { addDisposer, cast } from '@jbrowse/mobx-state-tree'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import { autorun } from 'mobx'

import type { SpreadsheetModel } from './SpreadsheetModel.tsx'
import type { SpreadsheetViewBaseModel, SpreadsheetViewInit } from './SpreadsheetViewModel.ts'
import type { MenuItem } from '@jbrowse/core/ui'

const minHeight = 40

export function enhance(base: SpreadsheetViewBaseModel) {
  return base
    .volatile(() => ({
      /**
       * #volatile
       */
      width: 400,
      /**
       * #volatile
       */
      rowMenuItems: [] as MenuItem[],
    }))
    .views(self => ({
      /**
       * #getter
       */
      get assembly() {
        const name = self.spreadsheet?.assemblyName
        return name
          ? getSession(self).assemblyManager.get(name)?.configuration
          : undefined
      },
    }))
    .actions(self => ({
      /**
       * #action
       */
      setRowMenuItems(newItems: MenuItem[]) {
        self.rowMenuItems = newItems
      },
      /**
       * #action
       */
      setWidth(newWidth: number) {
        self.width = newWidth
        return self.width
      },
      /**
       * #action
       */
      setHeight(newHeight: number) {
        self.height = Math.max(newHeight, minHeight)
        return self.height
      },
      /**
       * #action
       */
      resizeHeight(distance: number) {
        const oldHeight = self.height
        const newHeight = this.setHeight(self.height + distance)
        return newHeight - oldHeight
      },
      /**
       * #action
       */
      resizeWidth(distance: number) {
        const oldWidth = self.width
        const newWidth = this.setWidth(self.width + distance)
        return newWidth - oldWidth
      },

      /**
       * #action
       * load a new spreadsheet and set our mode to display it
       */
      displaySpreadsheet(spreadsheet?: SpreadsheetModel) {
        self.spreadsheet = cast(spreadsheet)
      },

      /**
       * #action
       */
      setInit(init?: SpreadsheetViewInit) {
        self.init = init
      },
    }))
    .actions(self => ({
      afterAttach() {
        addDisposer(
          self,
          autorun(
            async function spreadsheetViewInitAutorun() {
              const { init, width } = self
              if (!width || !init) {
                return
              }

              const session = getSession(self)

              try {
                const exts = init.uri.split('.')
                let ext = exts.pop()?.toUpperCase()
                if (ext === 'GZ') {
                  ext = exts.pop()?.toUpperCase()
                }

                self.importWizard.setFileType(init.fileType || ext || '')
                self.importWizard.setSelectedAssemblyName(init.assembly)
                self.importWizard.setFileSource({
                  uri: init.uri,
                  locationType: 'UriLocation',
                })
                await self.importWizard.import(init.assembly)
              } catch (e) {
                console.error(e)
                session.notifyError(`${e}`, e)
              } finally {
                self.setInit(undefined)
              }
            },
            { name: 'SpreadsheetViewInit' },
          ),
        )
      },
    }))
    .views(self => ({
      /**
       * #method
       */
      menuItems() {
        return [
          {
            label: 'Return to import form',
            icon: FolderOpenIcon,
            onClick: () => {
              self.displaySpreadsheet(undefined)
            },
          },
        ]
      },
    }))
    .postProcessSnapshot(snap => {
      const { init, importWizard, spreadsheet, ...rest } = snap as Omit<
        typeof snap,
        symbol
      >
      if (importWizard.cachedFileLocation && spreadsheet) {
        const { rowSet, ...spreadsheetRest } = spreadsheet as Omit<
          typeof spreadsheet,
          symbol
        >

        return {
          ...rest,
          importWizard,
          spreadsheet: spreadsheetRest,
        }
      } else if (spreadsheet) {
        const { rowSet, ...spreadsheetRest } = spreadsheet as Omit<
          typeof spreadsheet,
          symbol
        >
        return rowSet && JSON.stringify(rowSet).length > 1_000_000
          ? {
              ...rest,
              importWizard,
              spreadsheet: spreadsheetRest,
            }
          : { ...rest, importWizard, spreadsheet }
      }
      return { ...rest, importWizard }
    })
}
