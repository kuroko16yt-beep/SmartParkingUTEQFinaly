import React from 'react'
import {
  CAlert,
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

import { useRegistros } from '../../hook/useRegistros'

const ListaRegistros = () => {
  const { registros, cargando, error, recargar } = useRegistros()

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Registros de estacionamiento</strong>
        <CButton color="success" variant="outline" onClick={recargar} disabled={cargando}>
          Actualizar
        </CButton>
      </CCardHeader>

      <CCardBody>
        {cargando && (
          <div className="text-center py-5">
            <CSpinner color="success" />
          </div>
        )}

        {!cargando && error && (
          <CAlert color="danger">No se pudieron cargar los registros: {error}</CAlert>
        )}

        {!cargando && !error && (
          <CTable align="middle" bordered hover responsive striped>
            <CTableHead color="dark">
              <CTableRow>
                <CTableHeaderCell>Código</CTableHeaderCell>
                <CTableHeaderCell>Placa</CTableHeaderCell>
                <CTableHeaderCell>Entrada</CTableHeaderCell>
                <CTableHeaderCell>Salida</CTableHeaderCell>
                <CTableHeaderCell>Duración (min)</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {registros.map((registro) => (
                <CTableRow key={registro.id}>
                  <CTableDataCell>{registro.codigo_registro}</CTableDataCell>
                  <CTableDataCell>{registro.placa_detectada}</CTableDataCell>
                  <CTableDataCell>{new Date(registro.fecha_entrada).toLocaleString()}</CTableDataCell>
                  <CTableDataCell>
                    {registro.fecha_salida ? new Date(registro.fecha_salida).toLocaleString() : '-'}
                  </CTableDataCell>
                  <CTableDataCell>{registro.duracion_minutos ?? '-'}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={registro.estado === 'ACTIVO' ? 'success' : 'secondary'}>
                      {registro.estado}
                    </CBadge>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ListaRegistros