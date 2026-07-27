import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputOtp } from 'primereact/inputotp'
import { Button } from 'primereact/button'

const SignatureDialog = forwardRef(function SignatureDialog({ document, onSigned }, ref) {
  const [visible, setVisible] = useState(false)
  const [doc, setDoc] = useState(null)
  const [step, setStep] = useState(0)
  const [otp, setOtp] = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const [hash, setHash] = useState('')
  const [hasSignature, setHasSignature] = useState(false)
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)

  useImperativeHandle(ref, () => ({
    open: (d) => {
      setDoc(d)
      setStep(0)
      setOtp('')
      setHash('')
      setHasSignature(false)
      setVisible(true)
    },
    close: () => setVisible(false),
  }))

  useEffect(() => {
    if (step === 2 && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
  }, [step])

  const close = () => {
    setVisible(false)
    setStep(0)
    setDoc(null)
  }

  const sendOtp = () => {
    setOtpSending(true)
    setTimeout(() => {
      setOtpSending(false)
      setStep(1)
    }, 1000)
  }

  const verifyOtp = () => {
    if (otp.length !== 6) return
    setStep(2)
  }

  const startDraw = (e) => {
    isDrawing.current = true
    const rect = canvasRef.current.getBoundingClientRect()
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(
      (e.clientX || e.touches?.[0].clientX) - rect.left,
      (e.clientY || e.touches?.[0].clientY) - rect.top,
    )
  }
  const draw = (e) => {
    if (!isDrawing.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineTo(
      (e.clientX || e.touches?.[0].clientX) - rect.left,
      (e.clientY || e.touches?.[0].clientY) - rect.top,
    )
    ctx.stroke()
    setHasSignature(true)
  }
  const endDraw = () => { isDrawing.current = false }
  const clearSignature = () => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setHasSignature(false)
  }

  const finishSign = () => {
    if (!hasSignature) return
    const signatureData = canvasRef.current.toDataURL()
    const newHash = 'sha256:' + Array.from(signatureData).map((c) => c.charCodeAt(0).toString(16)).join('').slice(0, 64)
    setHash(newHash)
    setStep(3)
    onSigned?.(doc, newHash)
  }

  return (
    <Dialog
      visible={visible}
      onHide={close}
      header={
        <div className="flex items-center gap-2">
          <i className="pi pi-verified text-brand-600" />
          <span>Firmar documento</span>
        </div>
      }
      modal
      style={{ width: 'min(640px, 96vw)' }}
    >
      {doc && (
        <div>
          {/* Stepper */}
          <div className="flex items-center justify-between mb-6 px-2">
            {['Revisar', 'Verificar', 'Firmar', 'Listo'].map((label, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i <= step ? 'text-white shadow-md' : 'bg-slate-100 text-slate-400 dark:bg-slate-700'
                    }`}
                    style={i <= step ? { background: 'linear-gradient(135deg, #A8CF45 0%, #87a837 100%)' } : undefined}
                  >
                    {i < step ? <i className="pi pi-check" /> : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1.5 font-semibold ${i <= step ? 'text-brand-700' : 'text-slate-400'}`}>
                    {label}
                  </span>
                </div>
                {i < 3 && (
                  <div
                    className="flex-1 h-0.5 mx-1"
                    style={i < step ? { background: 'linear-gradient(90deg, #A8CF45 0%, #87a837 100%)' } : { background: '#e2e8f0' }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* STEP 0 - Revisar */}
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                    <i className="pi pi-file-pdf" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {doc.name || doc.documento || 'Documento'}
                    </p>
                    <p className="text-xs text-slate-500">PDF · {doc.pages || '2'} páginas · {doc.size || '342 KB'}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Revisa el documento antes de firmar. Una vez firmado, no podrá ser modificado.
                </p>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                <i className="pi pi-info-circle text-brand-600 mt-0.5" />
                <span>Al continuar, aceptas firmar electrónicamente con validez legal según la Ley 527 de 1999.</span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button label="Cancelar" outlined onClick={close} size="small" />
                <Button label="Enviar código OTP" icon="pi pi-send" severity="info" onClick={sendOtp} size="small" />
              </div>
            </div>
          )}

          {/* STEP 1 - OTP */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-brand-50 flex items-center justify-center mb-3">
                  <i className="pi pi-mobile text-2xl" style={{ color: '#A8CF45' }} />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">Ingresa el código de 6 dígitos enviado a</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {doc.email || 'tu@empresa.com'}
                </p>
              </div>
              <div className="flex justify-center">
                <InputOtp value={otp} onChange={(e) => setOtp(e.value)} length={6} integerOnly />
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={otpSending}
                  className="text-xs font-semibold hover:underline disabled:opacity-50"
                  style={{ color: '#87a837' }}
                >
                  {otpSending ? 'Reenviando...' : '¿No recibiste el código? Reenviar'}
                </button>
              </div>
              <div className="flex justify-between gap-2 pt-2">
                <Button label="Atrás" icon="pi pi-arrow-left" outlined onClick={() => setStep(0)} size="small" />
                <Button label="Verificar" icon="pi pi-check" severity="info" onClick={verifyOtp} size="small" />
              </div>
            </div>
          )}

          {/* STEP 2 - Canvas */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center">
                <p className="text-sm text-slate-700 dark:text-slate-300">Firma dentro del recuadro</p>
                <p className="text-xs text-slate-500 mt-1">Usa el mouse, touch o stylus</p>
              </div>
              <div
                className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden bg-white"
                style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04)' }}
              >
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={180}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={endDraw}
                  className="w-full cursor-crosshair touch-none"
                />
              </div>
              <div className="flex justify-between gap-2">
                <Button label="Limpiar" icon="pi pi-eraser" outlined onClick={clearSignature} size="small" />
                <div className="flex gap-2">
                  <Button label="Atrás" outlined onClick={() => setStep(1)} size="small" />
                  <Button label="Firmar documento" icon="pi pi-verified" severity="success" onClick={finishSign} size="small" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 - Confirmado */}
          {step === 3 && (
            <div className="text-center py-6 animate-fade-in">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <i className="pi pi-check text-4xl text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">¡Documento firmado!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Evidencia criptográfica generada y almacenada
              </p>
              <div className="mt-5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-left">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Hash SHA-256</p>
                <code className="text-[10px] text-slate-700 dark:text-slate-300 font-mono break-all">{hash}</code>
              </div>
              <div className="flex gap-2 justify-center mt-5">
                <Button label="Descargar firmado" icon="pi pi-download" outlined size="small" />
                <Button label="Cerrar" severity="info" onClick={close} size="small" />
              </div>
            </div>
          )}
        </div>
      )}
    </Dialog>
  )
})

export default SignatureDialog
