import { lazy } from 'react'

import DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'

import configSchemaF from './configSchemaF.ts'
import stateModelF from './model.ts'

import type PluginManager from '@jbrowse/core/PluginManager'

const LazyBaseLinearDisplayComponent = lazy(() =>
  import('@jbrowse/plugin-linear-genome-view').then(m => ({
    default: m.BaseLinearDisplayComponent,
  })),
)

export default function LGVSyntenyDisplayF(pluginManager: PluginManager) {
  pluginManager.addDisplayType(() => {
    const configSchema = configSchemaF(pluginManager)
    const stateModel = stateModelF(configSchema)
    return new DisplayType({
      name: 'LGVSyntenyDisplay',
      configSchema,
      stateModel,
      trackType: 'SyntenyTrack',
      viewType: 'LinearGenomeView',
      ReactComponent: LazyBaseLinearDisplayComponent,
    })
  })
}
