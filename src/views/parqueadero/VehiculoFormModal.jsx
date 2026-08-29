import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CAlert,
  CButton,
  CCol,
  CForm,
  CFormCheck,
  CFormFeedback,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from '@coreui/react'

import { TIPOS_VEHICULO, VALORES_INICIALES, validarVehiculo } from './vehiculoValidacion'

// Modal reutilizable para "Agregar" y "Editar". Cuando `vehiculo` viene
// definido, el formulario se precarga y actúa en modo edición.
const VehiculoFormModal = ({ visible, vehiculo, guardando, onGuardar, onCerrar }) => {
  const [valores, setValores] = useState(VALORES_INICIALES)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')

  const esEdicion = Boolean(vehiculo)

  useEffect(() => {
    if (!visible) return

    if (vehiculo) {
      setValores({
        placa: vehiculo.placa ?? '',
        marca: vehiculo.marca ?? '',
        modelo: vehiculo.modelo ?? '',
        anio: vehiculo.anio ?? new Date().getFullYear(),
        color: vehiculo.color ?? '',
        tipo: vehiculo.tipo ?? 'AUTOMOVIL',
        foto_url: vehiculo.foto_url ?? '',
        foto_fuente_url: vehiculo.foto_fuente_url ?? '',
        foto_propietario_url: vehiculo.foto_propietario_url ?? '',
        cedula_propietario: vehiculo.cedula_propietario ?? '',
        propietario_nombre: vehiculo.propietario_nombre ?? '',
        correo_institucional: vehiculo.correo_institucional ?? '',
        correo_microsoft: vehiculo.correo_microsoft ?? '',
        autorizado: vehiculo.autorizado ?? true,
      })
    } else {
      setValores(VALORES_INICIALES)
    }

    setErrores({})
    setErrorGeneral('')
  }, [visible, vehiculo])

  const manejarCambio = (campo) => (evento) => {
    const valor = evento.target.type === 'checkbox' ? evento.target.checked : evento.target.value
    setValores((actuales) => ({ ...actuales, [campo]: valor }))
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault()

    const erroresEncontrados = validarVehiculo(valores)
    setErrores(erroresEncontrados)
    setErrorGeneral('')

    if (Object.keys(erroresEncontrados).length > 0) {
      return
    }

    const resultado = await onGuardar(valores)

    if (!resultado.exito) {
      setErrorGeneral(resultado.mensaje)
    }
  }

  return (
    <CModal
      visible={visible}
      onClose={guardando ? undefined : onCerrar}
      size="lg"
      backdrop="static"
    >
      <CForm onSubmit={manejarEnvio} noValidate>
        <CModalHeader closeButton={!guardando}>
          <CModalTitle>
            {esEdicion ? 'Editar vehículo y propietario' : 'Agregar vehículo y propietario'}
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          {errorGeneral && (
            <CAlert color="danger" className="mb-3">
              {errorGeneral}
            </CAlert>
          )}

          <h6 className="text-body-secondary text-uppercase small mb-3">Datos del vehículo</h6>
          <CRow className="g-3 mb-4">
            <CCol md={4}>
              <CFormLabel htmlFor="placa">Placa</CFormLabel>
              <CFormInput
                id="placa"
                placeholder="AAA-1234"
                value={valores.placa}
                onChange={manejarCambio('placa')}
                invalid={Boolean(errores.placa)}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.placa}</CFormFeedback>
            </CCol>

            <CCol md={4}>
              <CFormLabel htmlFor="marca">Marca</CFormLabel>
              <CFormInput
                id="marca"
                value={valores.marca}
                onChange={manejarCambio('marca')}
                invalid={Boolean(errores.marca)}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.marca}</CFormFeedback>
            </CCol>

            <CCol md={4}>
              <CFormLabel htmlFor="modelo">Modelo</CFormLabel>
              <CFormInput
                id="modelo"
                value={valores.modelo}
                onChange={manejarCambio('modelo')}
                invalid={Boolean(errores.modelo)}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.modelo}</CFormFeedback>
            </CCol>

            <CCol md={3}>
              <CFormLabel htmlFor="anio">Año</CFormLabel>
              <CFormInput
                id="anio"
                type="number"
                min={1990}
                max={2035}
                value={valores.anio}
                onChange={manejarCambio('anio')}
                invalid={Boolean(errores.anio)}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.anio}</CFormFeedback>
            </CCol>

            <CCol md={3}>
              <CFormLabel htmlFor="color">Color</CFormLabel>
              <CFormInput
                id="color"
                value={valores.color}
                onChange={manejarCambio('color')}
                invalid={Boolean(errores.color)}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.color}</CFormFeedback>
            </CCol>

            <CCol md={3}>
              <CFormLabel htmlFor="tipo">Tipo</CFormLabel>
              <CFormSelect
                id="tipo"
                value={valores.tipo}
                onChange={manejarCambio('tipo')}
                invalid={Boolean(errores.tipo)}
                disabled={guardando}
              >
                {TIPOS_VEHICULO.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </CFormSelect>
              <CFormFeedback invalid>{errores.tipo}</CFormFeedback>
            </CCol>

            <CCol md={3} className="d-flex align-items-end">
              <CFormCheck
                id="autorizado"
                label="Autorizado"
                checked={valores.autorizado}
                onChange={manejarCambio('autorizado')}
                disabled={guardando}
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="foto_url">URL de la foto del vehículo</CFormLabel>
              <CFormInput
                id="foto_url"
                value={valores.foto_url}
                onChange={manejarCambio('foto_url')}
                invalid={Boolean(errores.foto_url)}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.foto_url}</CFormFeedback>
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="foto_fuente_url">URL de la fuente de la foto</CFormLabel>
              <CFormInput
                id="foto_fuente_url"
                value={valores.foto_fuente_url}
                onChange={manejarCambio('foto_fuente_url')}
                invalid={Boolean(errores.foto_fuente_url)}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.foto_fuente_url}</CFormFeedback>
            </CCol>
          </CRow>

          <h6 className="text-body-secondary text-uppercase small mb-3">Datos del propietario</h6>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel htmlFor="propietario_nombre">Nombre completo</CFormLabel>
              <CFormInput
                id="propietario_nombre"
                value={valores.propietario_nombre}
                onChange={manejarCambio('propietario_nombre')}
                invalid={Boolean(errores.propietario_nombre)}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.propietario_nombre}</CFormFeedback>
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="cedula_propietario">Cédula (10 dígitos)</CFormLabel>
              <CFormInput
                id="cedula_propietario"
                value={valores.cedula_propietario}
                onChange={manejarCambio('cedula_propietario')}
                invalid={Boolean(errores.cedula_propietario)}
                disabled={guardando}
                maxLength={10}
              />
              <CFormFeedback invalid>{errores.cedula_propietario}</CFormFeedback>
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="correo_institucional">Correo institucional</CFormLabel>
              <CFormInput
                id="correo_institucional"
                type="email"
                value={valores.correo_institucional}
                onChange={manejarCambio('correo_institucional')}
                invalid={Boolean(errores.correo_institucional)}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.correo_institucional}</CFormFeedback>
            </CCol>

            <CCol md={6}>
              <CFormLabel htmlFor="correo_microsoft">Correo de Microsoft (opcional)</CFormLabel>
              <CFormInput
                id="correo_microsoft"
                type="email"
                value={valores.correo_microsoft}
                onChange={manejarCambio('correo_microsoft')}
                invalid={Boolean(errores.correo_microsoft)}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.correo_microsoft}</CFormFeedback>
            </CCol>

            <CCol md={12}>
              <CFormLabel htmlFor="foto_propietario_url">URL de la foto del propietario</CFormLabel>
              <CFormInput
                id="foto_propietario_url"
                value={valores.foto_propietario_url}
                onChange={manejarCambio('foto_propietario_url')}
                invalid={Boolean(errores.foto_propietario_url)}
                disabled={guardando}
              />
              <CFormFeedback invalid>{errores.foto_propietario_url}</CFormFeedback>
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </CButton>
          <CButton type="submit" color="success" disabled={guardando}>
            {guardando && <CSpinner size="sm" className="me-2" />}
            {esEdicion ? 'Guardar cambios' : 'Registrar vehículo'}
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

VehiculoFormModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  vehiculo: PropTypes.object,
  guardando: PropTypes.bool.isRequired,
  onGuardar: PropTypes.func.isRequired,
  onCerrar: PropTypes.func.isRequired,
}

export default VehiculoFormModal
