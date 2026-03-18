import { lazy } from 'react'

import { DisplayType } from '@jbrowse/core/pluggableElementTypes'

import { configSchemaFactory } from './configSchema.ts'
import { stateModelFactory } from './model.ts'

import type PluginManager from '@jbrowse/core/PluginManager'

const LazyBaseLinearDisplayComponent = lazy(() =>
  import('@jbrowse/plugin-linear-genome-view').then(m => ({
    default: m.BaseLinearDisplayComponent,
  })),
)

export default function LinearLollipopDisplayF(pluginManager: PluginManager) {
  pluginManager.addDisplayType(() => {
    const configSchema = configSchemaFactory(pluginManager)
    return new DisplayType({
      name: 'LinearLollipopDisplay',
      configSchema,
      stateModel: stateModelFactory(configSchema),
      trackType: 'LollipopTrack',
      viewType: 'LinearGenomeView',
      ReactComponent: LazyBaseLinearDisplayComponent,
    })
  })
}
