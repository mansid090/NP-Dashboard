import React, { useState } from 'react'
import { Plus, Trash2, Edit3, Save, X, Link2, Info, ChevronDown, ChevronUp } from 'lucide-react'

const EMPTY_EMP = { id: '', name: '', managerId: '', joiningDate: '', probationStatus: 'active', sheetUrl: '', confirmationDate: null }
const EMPTY_MGR = { id: '', name: '', role: '' }

function genId(prefix) { return `${prefix}_${Date.now().toString(36)}` }

function InfoBox() {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-np-blue/20 rounded-xl bg-np-blue-light text-np-blue text-xs overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 font-semibold">
        <div className="flex items-center gap-1.5"><Info size={13}/> Google Sheets Setup Guide</div>
        {open ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1.5 border-t border-np-blue/15 pt-2.5 text-np-text/80">
          <p className="font-semibold text-np-blue mb-1">Expected sheet column layout:</p>
          <pre className="bg-white/70 rounded p-2 text-[10px] font-mono overflow-x-auto leading-relaxed">
{`Row 1: [blank]              | 24 May – 1 Jun | 1 Jun – 8 Jun | …
Row 2: One Thing             | employee text  | employee text | …
Row 3: Additional Goal       | employee text  | employee text | …
Row 4: Learnings of the Week | employee text  | employee text | …
Row 5: Self Comments         | employee text  | employee text | …
Row 6: Manager Score         | 8              | 7.5           | …
Row 7: Manager Comment       | manager text   | manager text  | …`}
          </pre>
          <p className="font-semibold text-np-blue mt-2">How to publish your sheet:</p>
          <ol className="list-decimal ml-4 space-y-0.5">
            <li>Open the employee's Google Sheet</li>
            <li>File → Share → Publish to web</li>
            <li>Select <strong>Comma-separated values (.csv)</strong></li>
            <li>Click <strong>Publish</strong> and copy the link</li>
            <li>Paste the link into the Sheet URL field below</li>
          </ol>
          <p className="mt-1.5 text-np-muted">
            Alternatively, share the sheet as <em>"Anyone with the link can view"</em> and paste the normal sheet URL — the app will auto-convert it.
          </p>
        </div>
      )}
    </div>
  )
}

export default function SheetLinkManager({ employees, managers, onSaveEmployees, onSaveManagers, onClose }) {
  const [emps,       setEmps]       = useState(employees.map(e => ({ ...e })))
  const [mgrs,       setMgrs]       = useState(managers.map(m => ({ ...m })))
  const [editEmpId,  setEditEmpId]  = useState(null)
  const [editMgrId,  setEditMgrId]  = useState(null)
  const [editEmpVal, setEditEmpVal] = useState(EMPTY_EMP)
  const [editMgrVal, setEditMgrVal] = useState(EMPTY_MGR)
  const [addingEmp,  setAddingEmp]  = useState(false)
  const [addingMgr,  setAddingMgr]  = useState(false)
  const [activeTab,  setActiveTab]  = useState('employees')

  // ─── Employees ───────────────────────────────────────────────
  function startEditEmp(emp) { setEditEmpId(emp.id); setEditEmpVal({ ...emp }) }
  function saveEmp() {
    setEmps(prev => prev.map(e => e.id === editEmpVal.id ? { ...editEmpVal } : e))
    setEditEmpId(null)
  }
  function addEmp() {
    const e = { ...editEmpVal, id: genId('emp') }
    setEmps(prev => [...prev, e])
    setAddingEmp(false); setEditEmpVal(EMPTY_EMP)
  }
  function deleteEmp(id) { setEmps(prev => prev.filter(e => e.id !== id)) }

  // ─── Managers ────────────────────────────────────────────────
  function startEditMgr(m) { setEditMgrId(m.id); setEditMgrVal({ ...m }) }
  function saveMgr() {
    setMgrs(prev => prev.map(m => m.id === editMgrVal.id ? { ...editMgrVal } : m))
    setEditMgrId(null)
  }
  function addMgr() {
    const m = { ...editMgrVal, id: genId('mgr') }
    setMgrs(prev => [...prev, m])
    setAddingMgr(false); setEditMgrVal(EMPTY_MGR)
  }
  function deleteMgr(id) { setMgrs(prev => prev.filter(m => m.id !== id)) }

  function handleSave() {
    onSaveEmployees(emps)
    onSaveManagers(mgrs)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pb-4 px-4 overflow-y-auto animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-np-border w-full max-w-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-np-border">
          <h2 className="text-base font-bold text-np-text">Admin Settings — Employee Sheets</h2>
          <button onClick={onClose}><X size={18} className="text-np-muted hover:text-np-text" /></button>
        </div>

        <div className="p-5 space-y-4">
          <InfoBox />

          {/* Tabs */}
          <div className="flex border-b border-np-border gap-1">
            <button onClick={() => setActiveTab('employees')}
              className={activeTab === 'employees' ? 'tab-btn-active' : 'tab-btn-inactive'}>
              Employees ({emps.length})
            </button>
            <button onClick={() => setActiveTab('managers')}
              className={activeTab === 'managers' ? 'tab-btn-active' : 'tab-btn-inactive'}>
              Managers ({mgrs.length})
            </button>
          </div>

          {/* ── Employees tab ── */}
          {activeTab === 'employees' && (
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {emps.map(emp => (
                <div key={emp.id} className="border border-np-border rounded-xl overflow-hidden">
                  {editEmpId === emp.id ? (
                    <EmpForm val={editEmpVal} setVal={setEditEmpVal} managers={mgrs}
                      onSave={saveEmp} onCancel={() => setEditEmpId(null)} />
                  ) : (
                    <div className="flex items-center justify-between px-4 py-2.5 bg-np-bg">
                      <div>
                        <p className="text-sm font-semibold text-np-text">{emp.name}</p>
                        <p className="text-xs text-np-muted">
                          {mgrs.find(m => m.id === emp.managerId)?.name || 'No manager'} ·{' '}
                          Joined {emp.joiningDate} ·{' '}
                          <span className={emp.probationStatus === 'confirmed' ? 'text-green-600' : 'text-amber-600'}>
                            {emp.probationStatus}
                          </span>
                        </p>
                        {emp.sheetUrl && (
                          <a href={emp.sheetUrl} target="_blank" rel="noreferrer"
                            className="text-[11px] text-np-blue hover:underline flex items-center gap-0.5">
                            <Link2 size={10}/> Sheet linked
                          </a>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEditEmp(emp)}
                          className="p-1.5 rounded-lg hover:bg-white text-np-muted hover:text-np-blue transition-colors">
                          <Edit3 size={14}/>
                        </button>
                        <button onClick={() => deleteEmp(emp.id)}
                          className="p-1.5 rounded-lg hover:bg-white text-np-muted hover:text-red-500 transition-colors">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add employee form */}
              {addingEmp ? (
                <div className="border border-np-blue rounded-xl overflow-hidden">
                  <EmpForm val={editEmpVal} setVal={setEditEmpVal} managers={mgrs}
                    onSave={addEmp} onCancel={() => { setAddingEmp(false); setEditEmpVal(EMPTY_EMP) }}
                    isNew />
                </div>
              ) : (
                <button onClick={() => { setAddingEmp(true); setEditEmpVal(EMPTY_EMP) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 border border-dashed border-np-border
                             rounded-xl text-sm text-np-muted hover:border-np-blue hover:text-np-blue transition-all">
                  <Plus size={14}/> Add Employee
                </button>
              )}
            </div>
          )}

          {/* ── Managers tab ── */}
          {activeTab === 'managers' && (
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {mgrs.map(mgr => (
                <div key={mgr.id} className="border border-np-border rounded-xl overflow-hidden">
                  {editMgrId === mgr.id ? (
                    <MgrForm val={editMgrVal} setVal={setEditMgrVal}
                      onSave={saveMgr} onCancel={() => setEditMgrId(null)} />
                  ) : (
                    <div className="flex items-center justify-between px-4 py-2.5 bg-np-bg">
                      <div>
                        <p className="text-sm font-semibold text-np-text">{mgr.name}</p>
                        <p className="text-xs text-np-muted">{mgr.role}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEditMgr(mgr)}
                          className="p-1.5 rounded-lg hover:bg-white text-np-muted hover:text-np-blue transition-colors">
                          <Edit3 size={14}/>
                        </button>
                        <button onClick={() => deleteMgr(mgr.id)}
                          className="p-1.5 rounded-lg hover:bg-white text-np-muted hover:text-red-500 transition-colors">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {addingMgr ? (
                <div className="border border-np-blue rounded-xl overflow-hidden">
                  <MgrForm val={editMgrVal} setVal={setEditMgrVal}
                    onSave={addMgr} onCancel={() => { setAddingMgr(false); setEditMgrVal(EMPTY_MGR) }} isNew />
                </div>
              ) : (
                <button onClick={() => { setAddingMgr(true); setEditMgrVal(EMPTY_MGR) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 border border-dashed border-np-border
                             rounded-xl text-sm text-np-muted hover:border-np-blue hover:text-np-blue transition-all">
                  <Plus size={14}/> Add Manager
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-np-border bg-np-bg rounded-b-2xl">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">
            <Save size={14}/> Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

function EmpForm({ val, setVal, managers, onSave, onCancel, isNew }) {
  const set = k => e => setVal(p => ({ ...p, [k]: e.target.value }))
  return (
    <div className="p-4 bg-white space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Full Name *</label>
          <input className="input text-sm" placeholder="Ankit Sharma" value={val.name} onChange={set('name')}/>
        </div>
        <div>
          <label className="label">Manager *</label>
          <select className="select text-sm" value={val.managerId} onChange={set('managerId')}>
            <option value="">— Select manager —</option>
            {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Joining Date *</label>
          <input type="date" className="input text-sm" value={val.joiningDate} onChange={set('joiningDate')}/>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="select text-sm" value={val.probationStatus} onChange={set('probationStatus')}>
            <option value="active">Active Probation</option>
            <option value="confirmed">Confirmed</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">Google Sheet URL (published CSV or sheet link)</label>
        <input className="input text-sm" placeholder="https://docs.google.com/spreadsheets/d/…"
          value={val.sheetUrl} onChange={set('sheetUrl')}/>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
        <button onClick={onSave}   className="btn-primary text-xs py-1.5 px-3">
          <Save size={12}/> {isNew ? 'Add' : 'Save'}
        </button>
      </div>
    </div>
  )
}

function MgrForm({ val, setVal, onSave, onCancel, isNew }) {
  const set = k => e => setVal(p => ({ ...p, [k]: e.target.value }))
  return (
    <div className="p-4 bg-white space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Full Name *</label>
          <input className="input text-sm" placeholder="Sanjay Mehta" value={val.name} onChange={set('name')}/>
        </div>
        <div>
          <label className="label">Role / Title</label>
          <input className="input text-sm" placeholder="Head of Operations" value={val.role} onChange={set('role')}/>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
        <button onClick={onSave}   className="btn-primary text-xs py-1.5 px-3">
          <Save size={12}/> {isNew ? 'Add' : 'Save'}
        </button>
      </div>
    </div>
  )
}
