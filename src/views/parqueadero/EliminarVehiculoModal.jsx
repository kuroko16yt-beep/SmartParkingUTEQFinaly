import React from 'react'
import PropTypes from 'prop-types'
import {
  CAlert,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'

const EliminarVehiculoModal = ({ visible, vehiculo, eliminando, error, onConfirmar, onCerrar }) => {
  if (!vehiculo) return null

  return (
    <CModal visible={visible} onClose={eliminando ? undefined : onCerrar} backdrop="static">
      <CModalHeader closeButton={!eliminando}>
        <CModalTitle>Eliminar vehículo</CModalTitle>
      </CModalHeader>

      <CModalBody>
        {error && (
          <CAlert color="danger" className="mb-3">
            {error}
          </CAlert>
        )}

        <p>
          ¿Estás seguro de que deseas eliminar el vehículo <strong>{vehiculo.placa}</strong> (
          {vehiculo.marca} {vehiculo.modelo}) registrado a nombre de{' '}
          <strong>{vehiculo.propietario_nombre}</strong>?
        </p>
        <p className="text-body-secondary small mb-0">Esta acción no se puede deshacer.</p>
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" variant="outline" onClick={onCerrar} disabled={eliminando}>
          Cancelar
        </CButton>
        <CButton color="danger" onClick={() => onConfirmar(vehiculo)} disabled={eliminando}>
          {eliminando && <CSpinner size="sm" className="me-2" />}
          Eliminar
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

EliminarVehiculoModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  vehiculo: PropTypes.object,
  eliminando: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onConfirmar: PropTypes.func.isRequired,
  onCerrar: PropTypes.func.isRequired,
}

export default EliminarVehiculoModal
