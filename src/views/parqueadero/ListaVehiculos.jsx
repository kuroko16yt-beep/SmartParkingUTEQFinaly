import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CToast,
  CToastBody,
  CToastClose,
  CToaster,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilTrash } from '@coreui/icons'

import { useVehiculos } from '../../hook/useVehiculos'
import { normalizarVehiculo } from './vehiculoValidacion'
import VehiculoFormModal from './VehiculoFormModal'
import EliminarVehiculoModal from './EliminarVehiculoModal'

const VEHICULOS_POR_PAGINA = 10

const ListaVehiculos = () => {
  const {
    vehiculos,
    cargando,
    guardando,
    eliminando,
    error,
    recargar,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo,
  } = useVehiculos()

  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)

  const [modalFormularioVisible, setModalFormularioVisible] = useState(false)
  const [vehiculoEnEdicion, setVehiculoEnEdicion] = useState(null)

  const [modalEliminarVisible, setModalEliminarVisible] = useState(false)
  const [vehiculoAEliminar, setVehiculoAEliminar] = useState(null)
  const [errorEliminar, setErrorEliminar] = useState('')

  const [toasts, setToasts] = useState([])
  const toasterRef = useRef()

  const mostrarToast = (color, mensaje) => {
    const id = Date.now()
    setToasts((actuales) => [...actuales, { id, color, mensaje }])
  }

  useEffect(() => {
    setPagina(1)
  }, [busqueda])

  const vehiculosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return vehiculos

    return vehiculos.filter((vehiculo) =>
      [
        vehiculo.placa,
        vehiculo.marca,
        vehiculo.modelo,
        vehiculo.color,
        vehiculo.propietario_nombre,
        vehiculo.correo_institucional,
      ].some((valor) => valor?.toLowerCase().includes(texto)),
    )
  }, [vehiculos, busqueda])

  const totalPaginas = Math.max(1, Math.ceil(vehiculosFiltrados.length / VEHICULOS_POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)

  const vehiculosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * VEHICULOS_POR_PAGINA
    return vehiculosFiltrados.slice(inicio, inicio + VEHICULOS_POR_PAGINA)
  }, [vehiculosFiltrados, paginaActual])

  // ----- Agregar / Editar -----

  const abrirModalAgregar = () => {
    setVehiculoEnEdicion(null)
    setModalFormularioVisible(true)
  }

  const abrirModalEditar = (vehiculo) => {
    setVehiculoEnEdicion(vehiculo)
    setModalFormularioVisible(true)
  }

  const cerrarModalFormulario = () => {
    setModalFormularioVisible(false)
    setVehiculoEnEdicion(null)
  }

  const manejarGuardar = async (valoresFormulario) => {
    const valores = normalizarVehiculo(valoresFormulario)

    const resultado = vehiculoEnEdicion
      ? await actualizarVehiculo(vehiculoEnEdicion.id, valores)
      : await crearVehiculo(valores)

    if (resultado.exito) {
      mostrarToast('success', resultado.mensaje)
      cerrarModalFormulario()
    } else {
      mostrarToast('danger', resultado.mensaje)
    }

    return resultado
  }

  // ----- Eliminar -----

  const abrirModalEliminar = (vehiculo) => {
    setVehiculoAEliminar(vehiculo)
    setErrorEliminar('')
    setModalEliminarVisible(true)
  }

  const cerrarModalEliminar = () => {
    setModalEliminarVisible(false)
    setVehiculoAEliminar(null)
    setErrorEliminar('')
  }

  const manejarEliminar = async (vehiculo) => {
    const resultado = await eliminarVehiculo(vehiculo)

    if (resultado.exito) {
      mostrarToast('success', resultado.mensaje)
      cerrarModalEliminar()
    } else {
      setErrorEliminar(resultado.mensaje)
    }
  }

  return (
    <CCard className="mb-4">
      <CToaster ref={toasterRef} placement="top-end">
        {toasts.map((toast) => (
          <CToast
            key={toast.id}
            autohide
            visible
            color={toast.color}
            className="text-white align-items-center"
            onClose={() => setToasts((actuales) => actuales.filter((t) => t.id !== toast.id))}
          >
            <div className="d-flex">
              <CToastBody>{toast.mensaje}</CToastBody>
              <CToastClose className="me-2 m-auto" white />
            </div>
          </CToast>
        ))}
      </CToaster>

      <CModalesGlobales
        modalFormularioVisible={modalFormularioVisible}
        vehiculoEnEdicion={vehiculoEnEdicion}
        guardando={guardando}
        manejarGuardar={manejarGuardar}
        cerrarModalFormulario={cerrarModalFormulario}
        modalEliminarVisible={modalEliminarVisible}
        vehiculoAEliminar={vehiculoAEliminar}
        eliminando={eliminando}
        errorEliminar={errorEliminar}
        manejarEliminar={manejarEliminar}
        cerrarModalEliminar={cerrarModalEliminar}
      />

      <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <strong>Vehículos y propietarios</strong>
          <div className="small text-body-secondary">
            Administración de vehículos autorizados en UTEQ Smart Parking
          </div>
        </div>

        <div className="d-flex gap-2">
          <CButton color="success" variant="outline" onClick={recargar} disabled={cargando}>
            Actualizar
          </CButton>
          <CButton color="success" onClick={abrirModalAgregar} disabled={cargando}>
            <CIcon icon={cilPlus} className="me-2" />
            Agregar vehículo
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody>
        <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
          <CFormInput
            type="search"
            placeholder="Buscar placa, vehículo o propietario..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            style={{ maxWidth: '420px' }}
          />

          <span className="text-body-secondary">{vehiculosFiltrados.length} vehículos</span>
        </div>

        {cargando && (
          <div className="text-center py-5">
            <CSpinner color="success" />
            <p className="mt-3">Cargando vehículos...</p>
          </div>
        )}

        {!cargando && error && (
          <CAlert color="danger">No se pudieron cargar los vehículos: {error}</CAlert>
        )}

        {!cargando && !error && (
          <>
            <CTable align="middle" bordered hover responsive striped>
              <CTableHead color="dark">
                <CTableRow>
                  <CTableHeaderCell>Foto del vehículo</CTableHeaderCell>
                  <CTableHeaderCell>Placa</CTableHeaderCell>
                  <CTableHeaderCell>Vehículo</CTableHeaderCell>
                  <CTableHeaderCell>Año / color</CTableHeaderCell>
                  <CTableHeaderCell>Foto del propietario</CTableHeaderCell>
                  <CTableHeaderCell>Propietario</CTableHeaderCell>
                  <CTableHeaderCell>Cédula</CTableHeaderCell>
                  <CTableHeaderCell>Correo</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                  <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {vehiculosPaginados.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={10} className="text-center py-4">
                      No se encontraron vehículos.
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  vehiculosPaginados.map((vehiculo) => (
                    <CTableRow key={vehiculo.id}>
                      <CTableDataCell>
                        <a
                          href={vehiculo.foto_fuente_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Abrir fuente de la imagen"
                        >
                          <img
                            src={vehiculo.foto_url}
                            alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                            width="100"
                            height="65"
                            loading="lazy"
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </a>
                      </CTableDataCell>

                      <CTableDataCell>
                        <CBadge color="dark" className="fs-6">
                          {vehiculo.placa}
                        </CBadge>
                      </CTableDataCell>

                      <CTableDataCell>
                        <strong>{vehiculo.marca}</strong>
                        <div className="small text-body-secondary">{vehiculo.modelo}</div>
                      </CTableDataCell>

                      <CTableDataCell>
                        {vehiculo.anio}
                        <div className="small text-body-secondary">{vehiculo.color}</div>
                      </CTableDataCell>

                      <CTableDataCell className="text-center">
                        <img
                          src={vehiculo.foto_propietario_url}
                          alt={`Fotografía de ${vehiculo.propietario_nombre}`}
                          width="60"
                          height="60"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          style={{
                            objectFit: 'cover',
                            borderRadius: '50%',
                            border: '2px solid var(--cui-border-color)',
                          }}
                        />
                      </CTableDataCell>

                      <CTableDataCell>{vehiculo.propietario_nombre}</CTableDataCell>

                      <CTableDataCell>{vehiculo.cedula_enmascarada}</CTableDataCell>

                      <CTableDataCell>
                        <a href={`mailto:${vehiculo.correo_institucional}`}>
                          {vehiculo.correo_institucional}
                        </a>
                      </CTableDataCell>

                      <CTableDataCell>
                        <CBadge color={vehiculo.autorizado ? 'success' : 'danger'}>
                          {vehiculo.autorizado ? 'Autorizado' : 'No autorizado'}
                        </CBadge>
                      </CTableDataCell>

                      <CTableDataCell>
                        <div className="d-flex gap-2">
                          <CTooltip content="Editar vehículo">
                            <CButton
                              color="info"
                              variant="outline"
                              size="sm"
                              onClick={() => abrirModalEditar(vehiculo)}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                          </CTooltip>

                          <CTooltip content="Eliminar vehículo">
                            <CButton
                              color="danger"
                              variant="outline"
                              size="sm"
                              onClick={() => abrirModalEliminar(vehiculo)}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </CTooltip>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <small className="text-body-secondary">
                Página {paginaActual} de {totalPaginas}
              </small>

              <div className="d-flex gap-2">
                <CButton
                  color="secondary"
                  variant="outline"
                  disabled={paginaActual === 1}
                  onClick={() => setPagina((valor) => Math.max(1, valor - 1))}
                >
                  Anterior
                </CButton>

                <CButton
                  color="success"
                  variant="outline"
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPagina((valor) => Math.min(totalPaginas, valor + 1))}
                >
                  Siguiente
                </CButton>
              </div>
            </div>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

// Agrupa los dos modales para que el render principal quede legible.
const CModalesGlobales = ({
  modalFormularioVisible,
  vehiculoEnEdicion,
  guardando,
  manejarGuardar,
  cerrarModalFormulario,
  modalEliminarVisible,
  vehiculoAEliminar,
  eliminando,
  errorEliminar,
  manejarEliminar,
  cerrarModalEliminar,
}) => (
  <>
    <VehiculoFormModal
      visible={modalFormularioVisible}
      vehiculo={vehiculoEnEdicion}
      guardando={guardando}
      onGuardar={manejarGuardar}
      onCerrar={cerrarModalFormulario}
    />

    <EliminarVehiculoModal
      visible={modalEliminarVisible}
      vehiculo={vehiculoAEliminar}
      eliminando={eliminando}
      error={errorEliminar}
      onConfirmar={manejarEliminar}
      onCerrar={cerrarModalEliminar}
    />
  </>
)

export default ListaVehiculos
