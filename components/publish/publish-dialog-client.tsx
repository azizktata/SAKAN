'use client'

import { Suspense } from 'react'
import { PublishDialog } from './publish-dialog'

export function PublishDialogClient() {
  return (
    <Suspense>
      <PublishDialog />
    </Suspense>
  )
}
