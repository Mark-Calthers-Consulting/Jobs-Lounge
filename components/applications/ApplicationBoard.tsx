'use client'
/* eslint-disable react-hooks/refs -- dnd-kit exposes callback refs and sensor attributes as its supported render API. */

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { toast } from 'sonner'
import type { ApplicationStatus } from '@/constants/enums'
import type { AdminApplication, ApplicationWorkspaceFilters } from '@/types/types'
import Modal from '@/components/Modal'
import { useApplicationList, useUpdateApplicationWorkflow } from '@/hooks/useApplicationWorkspace'
import { ApplicationCard, STAGES, stageLabel } from './workspaceUi'

function DraggableCard({
  application,
  selected,
  onSelect,
}: {
  application: AdminApplication
  selected: boolean
  onSelect: () => void
}) {
  const draggable = useDraggable({
    id: application.applicationId,
    data: { application },
  })
  const style = draggable.transform
    ? { transform: `translate3d(${draggable.transform.x}px, ${draggable.transform.y}px, 0)` }
    : undefined

  return (
    <div ref={draggable.setNodeRef} style={style} className={draggable.isDragging ? 'opacity-30' : ''}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          ref={draggable.setActivatorNodeRef}
          {...draggable.listeners}
          {...draggable.attributes}
          aria-label={`Move ${application.name}. Press space to pick up, arrow keys to move, and space to drop.`}
          className="cursor-grab rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 active:cursor-grabbing"
        >
          ⠿
        </button>
        <div className="min-w-0 flex-1">
          <ApplicationCard application={application} selected={selected} onSelect={onSelect} />
        </div>
      </div>
    </div>
  )
}

function BoardColumn({
  status,
  applications,
  total,
  selectedId,
  onSelect,
  hasNextPage,
  isLoadingMore,
  loadMore,
}: {
  status: ApplicationStatus
  applications: AdminApplication[]
  total: number
  selectedId?: string
  onSelect: (id: string) => void
  hasNextPage: boolean
  isLoadingMore: boolean
  loadMore: () => void
}) {
  const droppable = useDroppable({ id: `stage:${status}`, data: { status } })
  return (
    <section ref={droppable.setNodeRef} aria-labelledby={`board-${status}`} className={`min-w-[18rem] flex-1 rounded-xl border p-3 ${droppable.isOver ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-slate-100/70'}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 id={`board-${status}`} className="font-semibold text-slate-950">{stageLabel(status)}</h2>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">{total}</span>
      </div>
      <div className="space-y-3">
        {applications.map((application) => (
          <DraggableCard key={application.applicationId} application={application} selected={selectedId === application.applicationId} onSelect={() => onSelect(application.applicationId)} />
        ))}
        {!applications.length ? <div className="rounded-lg border border-dashed border-slate-300 bg-white/60 p-5 text-center text-sm text-slate-500">Drop an application here</div> : null}
      </div>
      {hasNextPage ? <button type="button" onClick={loadMore} disabled={isLoadingMore} className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50">{isLoadingMore ? 'Loading…' : 'Load more'}</button> : null}
    </section>
  )
}

const StageQuery = ({
  jobId,
  status,
  filters,
  children,
}: {
  jobId: string
  status: ApplicationStatus
  filters: ApplicationWorkspaceFilters
  children: (result: ReturnType<typeof useApplicationList>) => React.ReactNode
}) => {
  const { cursor: _cursor, status: _status, ...boardFilters } = filters
  void _cursor
  void _status
  return children(useApplicationList({
    ...boardFilters,
    jobId,
    status: [status],
    limit: 20,
  }))
}

export default function ApplicationBoard({
  jobId,
  filters,
  selectedId,
  onSelect,
}: {
  jobId: string
  filters: ApplicationWorkspaceFilters
  selectedId?: string
  onSelect: (id: string) => void
}) {
  const update = useUpdateApplicationWorkflow()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const [active, setActive] = useState<AdminApplication>()
  const [rejection, setRejection] = useState<AdminApplication>()

  const move = async (application: AdminApplication, status: ApplicationStatus, undo = false) => {
    if (status === application.status) return
    const previous = application.status
    try {
      const result = await update.mutateAsync({
        applicationId: application.applicationId,
        expectedVersion: application.workflowVersion,
        status,
        undo,
      })
      toast.success(`${application.name} moved to ${stageLabel(status)}`, {
        duration: undo ? 4000 : 8000,
        action: !undo ? {
          label: 'Undo',
          onClick: () => void move({ ...application, status, workflowVersion: result.workflowVersion }, previous, true),
        } : undefined,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to move application')
    } finally {
      setRejection(undefined)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActive(event.active.data.current?.application)
  }
  const handleDragEnd = (event: DragEndEvent) => {
    const application = event.active.data.current?.application as AdminApplication | undefined
    const status = event.over?.data.current?.status as ApplicationStatus | undefined
    setActive(undefined)
    if (!application || !status || status === application.status) return
    if (status === 'rejected') setRejection(application)
    else void move(application, status)
  }

  return (
    <>
      <Modal
        isOpen={Boolean(rejection)}
        onClose={() => setRejection(undefined)}
        onSubmit={() => rejection && void move(rejection, 'rejected')}
        title="Reject this application?"
        body={<p>This stage is private and does not notify the candidate.</p>}
        actionLabel="Move to Rejected"
        actionTone="danger"
        disabled={update.isPending}
        size="compact"
      />
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragCancel={() => setActive(undefined)}
        onDragEnd={handleDragEnd}
        accessibility={{
          screenReaderInstructions: {
            draggable: 'Press space to pick up an application. Use arrow keys to move it between hiring stages. Press space to drop or Escape to cancel.',
          },
          announcements: {
            onDragStart: ({ active: item }) => `Picked up ${item.data.current?.application?.name}.`,
            onDragOver: ({ active: item, over }) => over ? `${item.data.current?.application?.name} is over ${stageLabel(over.data.current?.status)}.` : 'Not over a hiring stage.',
            onDragEnd: ({ active: item, over }) => over ? `${item.data.current?.application?.name} was dropped in ${stageLabel(over.data.current?.status)}.` : 'Move cancelled.',
            onDragCancel: ({ active: item }) => `Move cancelled for ${item.data.current?.application?.name}.`,
          },
        }}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <StageQuery key={stage.value} jobId={jobId} status={stage.value} filters={filters}>
              {(query) => {
                const applications = query.data?.pages.flatMap((page) => page.data) ?? []
                const total = query.data?.pages[0]?.stageTotals[stage.value] ?? 0
                return <BoardColumn status={stage.value} applications={applications} total={total} selectedId={selectedId} onSelect={onSelect} hasNextPage={Boolean(query.hasNextPage)} isLoadingMore={query.isFetchingNextPage} loadMore={() => void query.fetchNextPage()} />
              }}
            </StageQuery>
          ))}
        </div>
        <DragOverlay>{active ? <div className="w-80 rotate-1 shadow-xl"><ApplicationCard application={active} onSelect={() => undefined} /></div> : null}</DragOverlay>
      </DndContext>
    </>
  )
}
