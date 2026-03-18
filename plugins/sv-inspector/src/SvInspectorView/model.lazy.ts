import { readConfObject } from '@jbrowse/core/configuration'
import { getEnv, getSession } from '@jbrowse/core/util'
import { addDisposer } from '@jbrowse/mobx-state-tree'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import { autorun, reaction } from 'mobx'

import type { SvInspectorViewBaseModel } from './model.ts'
import type { Region } from '@jbrowse/core/util'
import type { Instance } from '@jbrowse/mobx-state-tree'

export type SvInspectorViewModel = Instance<ReturnType<typeof enhance>>

export function enhance(base: SvInspectorViewBaseModel) {
  const minHeight = 400
  const headerHeight = 52
  const circularViewOptionsBarHeight = 52

  return base
    .volatile(self => {
      const { pluginManager } = getEnv(self)
      const SpreadsheetViewType = pluginManager.getViewType('SpreadsheetView')!
      const CircularViewType = pluginManager.getViewType('CircularView')!
      return {
        /**
         * #volatile
         */
        width: 800,
        /**
         * #volatile
         */
        SpreadsheetViewReactComponent: SpreadsheetViewType.ReactComponent,
        /**
         * #volatile
         */
        CircularViewReactComponent: CircularViewType.ReactComponent,
        /**
         * #volatile
         */
        circularViewOptionsBarHeight,
      }
    })
    .views(self => ({
      /**
       * #getter
       */
      get assemblyName() {
        const { assembly } = self.spreadsheetView
        return assembly
          ? (readConfObject(assembly, 'name') as string)
          : undefined
      },
      /**
       * #getter
       */
      get showCircularView() {
        return !!self.spreadsheetView.spreadsheet?.rowSet
      },

      /**
       * #getter
       */
      get features() {
        return (
          structuredClone(self.spreadsheetView.spreadsheet?.visibleRows)
            ?.map(row => row.feature)
            .filter(f => !!f) || []
        )
      },
      /**
       * #getter
       */
      get featuresAdapterConfigSnapshot() {
        return {
          type: 'FromConfigAdapter',
          features: this.features,
        }
      },
      /**
       * #getter
       */
      get featureRefNames() {
        return [
          ...new Set(
            [
              ...this.features.map(r => r.refName),
              // @ts-expect-error
              ...this.features.flatMap(r => r.INFO?.CHR2),
              // @ts-expect-error
              ...this.features.flatMap(r => r.mate?.refName),
            ].filter(f => !!f),
          ),
        ]
      },
      get currentAssembly() {
        const { assemblyManager } = getSession(self)
        return this.assemblyName
          ? assemblyManager.get(this.assemblyName)
          : undefined
      },

      /**
       * #getter
       */
      get canonicalFeatureRefNameSet() {
        const asm = this.currentAssembly
        return new Set(
          asm?.initialized
            ? this.featureRefNames.map(r => asm.getCanonicalRefName(r) || r)
            : [],
        )
      },
      /**
       * #getter
       */
      get featuresCircularTrackConfiguration() {
        return {
          type: 'VariantTrack',
          trackId: `sv-inspector-variant-track-${self.id}`,
          name: 'features from tabular data',
          adapter: this.featuresAdapterConfigSnapshot,
          assemblyNames: [this.assemblyName],
          displays: [
            {
              type: 'ChordVariantDisplay',
              displayId: `sv-inspector-variant-track-chord-display-${self.id}`,
              onChordClick:
                'jexl:defaultOnChordClick(feature, track, pluginManager)',
              renderer: {
                type: 'StructuralVariantChordRenderer',
              },
            },
          ],
        }
      },
    }))

    .actions(self => ({
      /**
       * #action
       */
      setWidth(newWidth: number) {
        self.width = newWidth
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
      setDisplayedRegions(regions: Region[]) {
        self.circularView.setDisplayedRegions(regions)
      },
      /**
       * #action
       */
      setOnlyDisplayRelevantRegionsInCircularView(val: boolean) {
        self.onlyDisplayRelevantRegionsInCircularView = val
      },

      /**
       * #action
       */
      setInit(init?: { assembly: string; uri: string; fileType?: string }) {
        self.init = init
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
              self.spreadsheetView.displaySpreadsheet(undefined)
            },
          },
        ]
      },
    }))
    .actions(self => ({
      /**
       * #action
       */
      resizeHeight(distance: number) {
        const oldHeight = self.height
        const newHeight = self.setHeight(self.height + distance)
        return newHeight - oldHeight
      },
      afterAttach() {
        // Init autorun for initializing from session snapshot
        addDisposer(
          self,
          autorun(
            async function svInspectorViewInitAutorun() {
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

                self.spreadsheetView.importWizard.setFileType(
                  init.fileType || ext || '',
                )
                self.spreadsheetView.importWizard.setSelectedAssemblyName(
                  init.assembly,
                )
                self.spreadsheetView.importWizard.setFileSource({
                  uri: init.uri,
                  locationType: 'UriLocation',
                })
                await self.spreadsheetView.importWizard.import(init.assembly)

                // Clear init state
                self.setInit(undefined)
              } catch (e) {
                console.error(e)
                session.notifyError(`${e}`, e)
                self.setInit(undefined)
              }
            },
            { name: 'SvInspectorViewInit' },
          ),
        )

        // synchronize subview widths
        addDisposer(
          self,
          autorun(
            () => {
              const borderWidth = 1
              if (self.showCircularView) {
                const spreadsheetWidth = Math.round(self.width * 0.66)
                const circularViewWidth = self.width - spreadsheetWidth
                self.spreadsheetView.setWidth(spreadsheetWidth - borderWidth)
                self.circularView.setWidth(circularViewWidth)
              } else {
                self.spreadsheetView.setWidth(self.width)
              }
            },
            { name: 'SvInspectorView width binding' },
          ),
        )
        // synchronize subview heights
        addDisposer(
          self,
          autorun(
            () => {
              self.spreadsheetView.setHeight(self.height - headerHeight)
              self.circularView.setHeight(
                self.height - headerHeight - circularViewOptionsBarHeight,
              )
            },
            {
              name: 'SvInspectorView height binding',
            },
          ),
        )

        // bind circularview displayedRegions to spreadsheet assembly, mediated
        // by the onlyRelevantRegions toggle
        addDisposer(
          self,
          autorun(
            async () => {
              const {
                onlyDisplayRelevantRegionsInCircularView,
                circularView,
                canonicalFeatureRefNameSet,
                currentAssembly,
              } = self
              if (!circularView.initialized || !currentAssembly?.regions) {
                return
              } else if (onlyDisplayRelevantRegionsInCircularView) {
                if (circularView.tracks.length === 1) {
                  try {
                    circularView.setDisplayedRegions(
                      structuredClone(
                        currentAssembly.regions.filter(r =>
                          canonicalFeatureRefNameSet.has(r.refName),
                        ),
                      ),
                    )
                  } catch (e) {
                    console.error(e)
                    getSession(self).notifyError(`${e}`, e)
                  }
                }
              } else {
                circularView.setDisplayedRegions(currentAssembly.regions)
              }
            },
            { name: 'SvInspectorView displayed regions bind' },
          ),
        )

        // bind circularview tracks to our track snapshot view
        addDisposer(
          self,
          reaction(
            () => ({
              generatedTrackConf: self.featuresCircularTrackConfiguration,
              assemblyName: self.assemblyName,
            }),
            data => {
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              if (!data) {
                return
              }
              const { assemblyName, generatedTrackConf } = data
              const { circularView } = self
              // hide any visible tracks
              for (const t of circularView.tracks) {
                circularView.hideTrack(t.configuration.trackId)
              }

              // put our track in as the only track
              if (assemblyName) {
                // @ts-expect-error
                circularView.addTrackConf(generatedTrackConf, {
                  assemblyName,
                })
              }
            },
            {
              name: 'SvInspectorView track configuration binding',
              fireImmediately: true,
            },
          ),
        )
      },
    }))
    .postProcessSnapshot(snap => {
      const { init, circularView, ...rest } = snap as Omit<typeof snap, symbol>
      return rest as Omit<typeof rest, symbol>
    })
}
