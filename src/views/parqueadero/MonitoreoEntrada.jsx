/**
 * MonitoreoEntrada.jsx
 * Vista de monitoreo de ingreso de vehículos al parqueadero UTEQ.
 * Captura imagen desde cámara o archivo, envía al endpoint OCR y muestra resultados.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCamera,
  cilCloudUpload,
  cilDescription,
  cilSearch,
  cilWarning,
  cilX,
} from '@coreui/icons'

/* ─── Constantes ─────────────────────────────────────────── */
const MAX_BYTES = 4 * 1024 * 1024 // 4 MiB
const TIPOS_ADMITIDOS = ['image/jpeg', 'image/png']

const ESTADO_INICIAL = {
  fase: 'idle', // idle | procesando | resultado | error
  resultado: null,
  errorMensaje: '',
}

/* ─── Componente principal ───────────────────────────────── */
const MonitoreoEntrada = () => {
  /* Cámara */
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  /* Estado de UI */
  const [camaraActiva, setCamaraActiva] = useState(false)
  const [imagenPrevia, setImagenPrevia] = useState(null) // data-URL para previsualizar
  const [archivoImagen, setArchivoImagen] = useState(null) // Blob/File para enviar
  const [estado, setEstado] = useState(ESTADO_INICIAL)

  /* ── Liberar cámara al desmontar ── */
  useEffect(() => {
    return () => detenerCamara()
  }, [])

  /* ── Cámara ── */
  const iniciarCamara = async () => {
    try {
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }, // cámara trasera en móvil
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCamaraActiva(true)
      limpiarResultado()
    } catch (err) {
      setEstado({
        fase: 'error',
        resultado: null,
        errorMensaje: `No se pudo acceder a la cámara: ${err.message}`,
      })
    }
  }

  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCamaraActiva(false)
  }

  const capturarFoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    // Guardar dataURL antes de detener la cámara
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    setImagenPrevia(dataUrl)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        setArchivoImagen(blob)
        detenerCamara()
        limpiarResultado()
      },
      'image/jpeg',
      0.92,
    )
  }

  /* ── Selección de archivo ── */
  const manejarArchivo = (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return

    if (!TIPOS_ADMITIDOS.includes(archivo.type)) {
      setEstado({
        fase: 'error',
        resultado: null,
        errorMensaje: 'Solo se admiten imágenes JPG o PNG.',
      })
      return
    }
    if (archivo.size > MAX_BYTES) {
      setEstado({
        fase: 'error',
        resultado: null,
        errorMensaje: 'La imagen supera el límite de 4 MiB.',
      })
      return
    }

    detenerCamara()
    setArchivoImagen(archivo)
    setImagenPrevia(URL.createObjectURL(archivo))
    limpiarResultado()
    // Resetear input para permitir seleccionar el mismo archivo de nuevo
    e.target.value = ''
  }

  /* ── Envío al endpoint OCR ── */
  const detectarPlaca = useCallback(async () => {
    if (!archivoImagen) return

    setEstado({ fase: 'procesando', resultado: null, errorMensaje: '' })

    try {
      const endpoint = 'https://ocruteqparking-btbbfsgvezd4ehgn.eastus2-01.azurewebsites.net/api/detectar-placa?code=1gMd5punlgy-LER3wkMH7ghxX9MNeGsrSJLReBB2bS5KAzFunfP8dA=='

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': archivoImagen.type || 'application/octet-stream',
        },
        body: archivoImagen,
      })

      if (!response.ok) {
        const msgHTTP = {
          400: 'Imagen vacía, inválida o con dimensiones no permitidas.',
          413: 'La imagen supera el tamaño máximo permitido (4 MiB).',
          415: 'Formato de imagen no admitido.',
          502: 'Error interno del servicio OCR o de la base de datos.',
          504: 'Tiempo de espera agotado. Intente de nuevo.',
        }
        throw new Error(msgHTTP[response.status] ?? `Error HTTP ${response.status}.`)
      }

      const resultado = await response.json()
      setEstado({ fase: 'resultado', resultado, errorMensaje: '' })
    } catch (err) {
      setEstado({
        fase: 'error',
        resultado: null,
        errorMensaje: err.message || 'Error inesperado al procesar la imagen.',
      })
    }
  }, [archivoImagen])

  /* ── Utilidades ── */
  const limpiarResultado = () => setEstado(ESTADO_INICIAL)

  const reiniciar = () => {
    detenerCamara()
    setImagenPrevia(null)
    setArchivoImagen(null)
    setEstado(ESTADO_INICIAL)
  }

  /* ─── Render ─────────────────────────────────────── */
  return (
    <>
      <div className="mb-4">
        <h4 className="fw-semibold mb-1">Monitoreo de entrada</h4>
        <p className="text-body-secondary mb-0">
          Reconocimiento automático de placas en tiempo real.
        </p>
      </div>

      <CRow className="g-4">
        {/* ── Columna izquierda: captura ── */}
        <CCol xs={12} lg={6}>
          <CCard className="h-100">
            <CCardHeader className="d-flex align-items-center gap-2">
              <CIcon icon={cilCamera} />
              <strong>Captura del vehículo</strong>
            </CCardHeader>
            <CCardBody>
              {/* Vista de cámara */}
              {camaraActiva && (
                <div className="mb-3 position-relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-100 rounded border"
                    style={{ maxHeight: '320px', objectFit: 'cover', background: '#000' }}
                  />
                  <canvas ref={canvasRef} className="d-none" />
                </div>
              )}

              {/* Vista previa de imagen */}
              {imagenPrevia && !camaraActiva && (
                <div className="mb-3 position-relative">
                  <img
                    src={imagenPrevia}
                    alt="Vista previa"
                    className="w-100 rounded border"
                    style={{ maxHeight: '320px', objectFit: 'contain', background: '#f8f9fa' }}
                  />
                </div>
              )}

              {/* Placeholder cuando no hay nada */}
              {!camaraActiva && !imagenPrevia && (
                <div
                  className="d-flex flex-column align-items-center justify-content-center rounded border mb-3 text-body-secondary"
                  style={{ minHeight: '200px', background: '#f8f9fa' }}
                >
                  <CIcon icon={cilCamera} size="3xl" className="mb-2" />
                  <span>Sin imagen</span>
                </div>
              )}

              {/* Botones de cámara */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                {!camaraActiva ? (
                  <CButton color="success" onClick={iniciarCamara}>
                    <CIcon icon={cilCamera} className="me-2" />
                    Activar cámara
                  </CButton>
                ) : (
                  <>
                    <CButton color="primary" onClick={capturarFoto}>
                      <CIcon icon={cilCamera} className="me-2" />
                      Capturar foto
                    </CButton>
                    <CButton color="secondary" variant="outline" onClick={detenerCamara}>
                      <CIcon icon={cilX} className="me-2" />
                      Detener
                    </CButton>
                  </>
                )}

                {/* Selección desde archivo */}
                <label className="btn btn-outline-secondary mb-0" style={{ cursor: 'pointer' }}>
                  <CIcon icon={cilCloudUpload} className="me-2" />
                  Subir imagen
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="d-none"
                    onChange={manejarArchivo}
                  />
                </label>
              </div>

              {/* Botón detectar */}
              {archivoImagen && (
                <div className="d-flex gap-2">
                  <CButton
                    color="success"
                    onClick={detectarPlaca}
                    disabled={estado.fase === 'procesando'}
                    className="flex-grow-1"
                  >
                    {estado.fase === 'procesando' ? (
                      <>
                        <CSpinner size="sm" className="me-2" />
                        Procesando…
                      </>
                    ) : (
                      <>
                        <CIcon icon={cilSearch} className="me-2" />
                        Detectar placa
                      </>
                    )}
                  </CButton>

                  <CButton color="secondary" variant="outline" onClick={reiniciar}>
                    Nueva captura
                  </CButton>
                </div>
              )}

              {/* Error de captura / validación */}
              {estado.fase === 'error' && (
                <CAlert color="danger" className="mt-3 mb-0">
                  <CIcon icon={cilWarning} className="me-2" />
                  {estado.errorMensaje}
                </CAlert>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* ── Columna derecha: resultados ── */}
        <CCol xs={12} lg={6}>
          <CCard className="h-100">
            <CCardHeader className="d-flex align-items-center gap-2">
              <CIcon icon={cilDescription} />
              <strong>Resultado del reconocimiento</strong>
            </CCardHeader>
            <CCardBody>
              {estado.fase === 'idle' && (
                <div className="text-center text-body-secondary py-5">
                  <CIcon icon={cilSearch} size="3xl" className="mb-3" />
                  <p>Capture o seleccione una imagen y pulse «Detectar placa».</p>
                </div>
              )}

              {estado.fase === 'procesando' && (
                <div className="text-center py-5">
                  <CSpinner color="success" className="mb-3" />
                  <p>Analizando imagen…</p>
                </div>
              )}

              {estado.fase === 'resultado' && estado.resultado && (
                <PanelResultado resultado={estado.resultado} onReiniciar={reiniciar} />
              )}

              {estado.fase === 'error' && (
                <div className="text-center py-4">
                  <CAlert color="danger">
                    <CIcon icon={cilWarning} className="me-2" />
                    {estado.errorMensaje}
                  </CAlert>
                  <CButton color="secondary" variant="outline" onClick={reiniciar}>
                    Reintentar
                  </CButton>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

/* ─── Sub-componente: panel de resultados ──────────────────── */
const PanelResultado = ({ resultado, onReiniciar }) => {
  const {
    estado,
    vehiculo_encontrado,
    placa_detectada,
    confianza,
    imagen_marcada,
    vehiculo,
  } = resultado

  /* Imagen con placa marcada */
  const imagenMarcada =
    imagen_marcada?.base64
      ? `data:${imagen_marcada.mime_type};base64,${imagen_marcada.base64}`
      : null

  /* ── Estados especiales ── */
  if (estado === 'sin_placa') {
    return (
      <AlertaEstado
        color="warning"
        titulo="Sin placa detectada"
        mensaje="No se encontró ninguna placa en la imagen. Intente con una imagen más clara."
        onReiniciar={onReiniciar}
      />
    )
  }
  if (estado === 'baja_confianza') {
    return (
      <AlertaEstado
        color="warning"
        titulo="Baja confianza"
        mensaje="La imagen no tiene suficiente calidad. Capture nuevamente."
        onReiniciar={onReiniciar}
      />
    )
  }
  if (estado === 'multiples_placas') {
    return (
      <AlertaEstado
        color="warning"
        titulo="Múltiples placas detectadas"
        mensaje="Se encontraron varias placas. Acerque la cámara al vehículo."
        onReiniciar={onReiniciar}
      />
    )
  }

  /* ── Vehículo no registrado ── */
  if (!vehiculo_encontrado || estado === 'no_registrado') {
    return (
      <>
        <CAlert color="danger" className="text-center fw-bold fs-5">
          <CIcon icon={cilWarning} className="me-2" />
          VEHÍCULO NO REGISTRADO
        </CAlert>

        {imagenMarcada && (
          <img
            src={imagenMarcada}
            alt="Vehículo con placa detectada"
            className="w-100 rounded border mb-3"
            style={{ maxHeight: '240px', objectFit: 'contain' }}
          />
        )}

        <FilaInfo label="Placa detectada" valor={placa_detectada ?? '—'} />
        <FilaInfo
          label="Confianza OCR"
          valor={confianza != null ? `${(confianza * 100).toFixed(1)} %` : '—'}
        />
        <FilaInfo label="Estado" valor={estado} />
        <FilaInfo
          label="Vehículo encontrado"
          valor={<span className="text-danger fw-bold">No</span>}
        />

        <CAlert color="danger" className="mt-3">
          <strong>Ingreso no autorizado.</strong> La placa no existe en la base de datos de
          Supabase.
        </CAlert>

        <CButton color="secondary" variant="outline" className="mt-2 w-100" onClick={onReiniciar}>
          Procesar otra imagen
        </CButton>
      </>
    )
  }

  /* ── Vehículo encontrado ── */
  const v = vehiculo || {}
  const propietario = v.propietario || {}
  const confianzaPct = confianza != null ? `${(confianza * 100).toFixed(1)} %` : '—'

  return (
    <>
      {/* Imagen marcada */}
      {imagenMarcada && (
        <img
          src={imagenMarcada}
          alt="Vehículo con placa detectada"
          className="w-100 rounded border mb-3"
          style={{ maxHeight: '240px', objectFit: 'contain' }}
        />
      )}

      {/* Datos del reconocimiento */}
      <h6 className="text-body-secondary text-uppercase small mb-2">Reconocimiento</h6>
      <FilaInfo label="Estado" valor={<CBadge color="success">Encontrado</CBadge>} />
      <FilaInfo label="Placa" valor={<strong>{placa_detectada}</strong>} />
      <FilaInfo label="Confianza OCR" valor={confianzaPct} />

      {/* Datos del vehículo */}
      <h6 className="text-body-secondary text-uppercase small mt-3 mb-2">Vehículo</h6>

      <div className="d-flex gap-3 mb-2 align-items-start">
        {v.foto_url && (
          <img
            src={v.foto_url}
            alt="Foto del vehículo"
            width={100}
            height={65}
            style={{ objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
          />
        )}
        <div className="flex-grow-1">
          <FilaInfo label="Marca" valor={v.marca} />
          <FilaInfo label="Modelo" valor={v.modelo} />
          <FilaInfo label="Año" valor={v.anio} />
          <FilaInfo label="Color" valor={v.color} />
          <FilaInfo label="Tipo" valor={v.tipo_vehiculo} />
        </div>
      </div>

      {/* Datos del propietario */}
      <h6 className="text-body-secondary text-uppercase small mt-3 mb-2">Propietario</h6>

      <div className="d-flex gap-3 align-items-start mb-2">
        {propietario.foto_url && (
          <img
            src={propietario.foto_url}
            alt="Foto del propietario"
            width={60}
            height={60}
            style={{
              objectFit: 'cover',
              borderRadius: '50%',
              border: '2px solid var(--cui-border-color)',
              flexShrink: 0,
            }}
          />
        )}
        <div className="flex-grow-1">
          <FilaInfo label="Nombre" valor={propietario.nombre} />
          <FilaInfo label="Cédula" valor={propietario.cedula_enmascarada} />
          <FilaInfo
            label="Autorización"
            valor={
              v.autorizado ? (
                <CBadge color="success">Autorizado</CBadge>
              ) : (
                <CBadge color="danger">No autorizado</CBadge>
              )
            }
          />
        </div>
      </div>

      <CButton color="secondary" variant="outline" className="mt-3 w-100" onClick={onReiniciar}>
        Procesar otra imagen
      </CButton>
    </>
  )
}

/* ─── Componentes auxiliares ──────────────────────────────── */
const FilaInfo = ({ label, valor }) => (
  <div className="d-flex justify-content-between border-bottom py-1 small">
    <span className="text-body-secondary">{label}</span>
    <span className="text-end">{valor ?? '—'}</span>
  </div>
)

const AlertaEstado = ({ color, titulo, mensaje, onReiniciar }) => (
  <div className="text-center py-3">
    <CAlert color={color}>
      <strong>{titulo}</strong>
      <div>{mensaje}</div>
    </CAlert>
    <CButton color="secondary" variant="outline" onClick={onReiniciar}>
      Intentar de nuevo
    </CButton>
  </div>
)

export default MonitoreoEntrada
