import { useState } from 'react'
import { TOOL_TEXT_LIMIT } from '../lib/queries.ts'
import { MAX_CALLS, undoView, type CallEntry, type View } from '../lib/store.ts'

const FLAG_URL = 'chrome://flags/#enable-webmcp-testing'

const TIME = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

function NoWebmcp() {
  const [copied, setCopied] = useState(false)
  return (
    <div className="nomcp">
      <span className="status-pill off">
        <span className="dot" />
        WebMCP unavailable
      </span>
      <h2>No agent connected</h2>
      <p>
        The 6 tools were not registered on this page, so no agent can read these numbers. The
        dashboard works exactly the same — it reads the same query layer the tools would.
      </p>
      <ol>
        <li>Chrome 149+</li>
        <li>{FLAG_URL}</li>
        <li>Enabled → relaunch</li>
      </ol>
      <div className="nomcp-actions">
        <button
          className="btn accent"
          onClick={() =>
            navigator.clipboard.writeText(FLAG_URL).then(
              () => setCopied(true),
              () => setCopied(false),
            )
          }
        >
          {copied ? 'Copied' : 'Copy flag URL'}
        </button>
        <button className="btn" onClick={() => location.reload()}>
          Recheck
        </button>
      </div>
    </div>
  )
}

function Call({
  call,
  open,
  canUndo,
  onToggle,
}: {
  call: CallEntry
  open: boolean
  canUndo: boolean
  onToggle: () => void
}) {
  return (
    <div className={call.readOnly ? 'call' : 'call write'} onClick={onToggle}>
      <div className="call-head">
        <span className="call-tool">{call.tool}</span>
        <span className="call-ts">{TIME.format(call.ts)}</span>
      </div>
      <div className="call-line">{JSON.stringify(call.input)}</div>
      {!open && <div className="call-line">→ {call.output}</div>}

      {open && (
        <div className="call-detail">
          <pre>{JSON.stringify(call.input, null, 2)}</pre>
          <pre>{call.output}</pre>
          <div className="chips">
            <span className={call.readOnly ? 'chip read' : 'chip write'}>
              {call.readOnly ? 'READ' : 'WRITE'}
            </span>
            <span className="chip">
              {call.chars} / {TOOL_TEXT_LIMIT} chars
            </span>
            <span className="chip">{call.ms} ms</span>
            {!call.readOnly && (
              <button
                className="chip undo"
                disabled={!canUndo}
                onClick={(e) => {
                  e.stopPropagation()
                  undoView()
                }}
              >
                Undo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AgentActivityLog({
  calls,
  previousView,
  webmcpReady,
}: {
  calls: CallEntry[]
  previousView: View | null
  webmcpReady: boolean
}) {
  const [expanded, setExpanded] = useState<number | null>(null)

  if (!webmcpReady) {
    return (
      <aside className="rail">
        <NoWebmcp />
      </aside>
    )
  }

  const open = expanded ?? calls[0]?.id
  const latestWrite = calls.find((c) => !c.readOnly)?.id

  return (
    <aside className="rail">
      <div className="rail-head">
        <h2 className="card-title">Agent activity</h2>
        <div className="rail-explainer">Every tool call the agent makes on this page.</div>
        <div className="legend">
          <span className="read">Read</span>
          <span className="write">Write</span>
        </div>
      </div>

      <div className="calls">
        {calls.length === 0 && <div className="empty">No calls yet.</div>}
        {calls.map((call) => (
          <Call
            key={call.id}
            call={call}
            open={call.id === open}
            canUndo={call.id === latestWrite && previousView !== null}
            onToggle={() => setExpanded(call.id === open ? -1 : call.id)}
          />
        ))}
        {calls.length === MAX_CALLS && (
          <div className="calls-collapse">Oldest calls collapse · keep {MAX_CALLS}</div>
        )}
      </div>

      <div className="rail-foot">
        Reads never change what you see. Writes are marked and always visible.
      </div>
    </aside>
  )
}
