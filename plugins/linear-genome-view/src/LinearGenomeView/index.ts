import { lazy } from 'react'

import { ViewType } from '@jbrowse/core/pluggableElementTypes'

import { stateModelFactory } from './model.ts'

import type PluginManager from '@jbrowse/core/PluginManager'

export default function LinearGenomeViewF(pluginManager: PluginManager) {
  pluginManager.addViewType(() => {
    return new ViewType({
      name: 'LinearGenomeView',
      displayName: 'Linear genome view',
      stateModel: stateModelFactory(pluginManager),
      ReactComponent: lazy(() => import('./components/LinearGenomeView.tsx')),
    })
  })
}

export * from './model.ts'
export * from './types.ts'
export {
  default as LinearGenomeView,
  default as ReactComponent,
} from './components/LinearGenomeView.tsx'
export { default as RefNameAutocomplete } from './components/RefNameAutocomplete/index.tsx'
export { default as SearchBox } from './components/SearchBox.tsx'
export { renderToSvg } from './svgcomponents/SVGLinearGenomeView.tsx'
