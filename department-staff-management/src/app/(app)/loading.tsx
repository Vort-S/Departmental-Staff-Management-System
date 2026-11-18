/** Navigation fallback. Skeletons never imply real staff data or fabricated statistics. */
export default function WorkspaceLoading(){return <div role="status" aria-live="polite" aria-label="Loading department workspace" className="space-y-6">
  <div className="space-y-3"><div className="skeleton h-8 w-52 max-w-full"/><div className="skeleton h-4 w-80 max-w-full"/></div>
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({length:4},(_,i)=><div key={i} className="card p-5 space-y-4"><div className="skeleton h-3 w-24 max-w-full"/><div className="skeleton h-9 w-16"/></div>)}</div>
  <div className="grid lg:grid-cols-2 gap-5">{Array.from({length:2},(_,i)=><div className="card p-6 space-y-5" key={i}><div className="skeleton h-5 w-40"/><div className="skeleton h-3 w-full"/><div className="skeleton h-3 w-4/5"/><div className="skeleton h-3 w-3/5"/></div>)}</div>
  <span className="sr-only">Loading…</span>
</div>}
