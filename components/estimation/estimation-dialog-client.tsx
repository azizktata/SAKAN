'use client'

import { Suspense } from 'react'
import { EstimationDialog } from './estimation-dialog'

export function EstimationDialogClient() {
  return (
    <Suspense>
      <EstimationDialog />
    </Suspense>
  )
}
