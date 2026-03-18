import { lazy } from 'react'

import { DisplayType } from '@jbrowse/core/pluggableElementTypes'

import configSchemaFactory from './configSchema.ts'
import stateModelFactory from './model.ts'

import type PluginManager from '@jbrowse/core/PluginManager'

const LazyBaseLinearDisplayComponent = lazy(() =>
  import('@jbrowse/plugin-linear-genome-view').then(m => ({
    default: m.BaseLinearDisplayComponent,
  })),
)

export default function MultiLinearWiggleDisplayF(
  pluginManager: PluginManager,
) {
  pluginManager.addDisplayType(() => {
    const configSchema = configSchemaFactory
    return new DisplayType({
      name: 'MultiLinearWiggleDisplay',
      displayName: 'Multi-Wiggle display',
      configSchema,
      stateModel: stateModelFactory(configSchema),
      trackType: 'MultiQuantitativeTrack',
      viewType: 'LinearGenomeView',
      ReactComponent: LazyBaseLinearDisplayComponent,
    })
  })
}
