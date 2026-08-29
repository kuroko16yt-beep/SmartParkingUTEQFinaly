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

import { usePuestos } from '../../hook/usePuestos'

const ListaPuestos = () => {
  const { puestos, cargando, error, recargar } = usePuestos()

  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>Puestos de parqueo</strong>
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

        {!cargando && error && <CAlert color="danger">No se pudieron cargar los puestos: {error}</CAlert>}

        {!cargando && !error && (
          <CTable align="middle" bordered hover responsive striped>
            <CTableHead color="dark">
              <CTableRow>
                <CTableHeaderCell>Código</CTableHeaderCell>
                <CTableHeaderCell>Columna</CTableHeaderCell>
                <CTableHeaderCell>Número</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell>Distancia (cm)</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {puestos.map((puesto) => (
                <CTableRow key={puesto.id}>
                  <CTableDataCell>{puesto.codigo}</CTableDataCell>
                  <CTableDataCell>{puesto.columna}</CTableDataCell>
                  <CTableDataCell>{puesto.numero}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={puesto.estado === 'DISPONIBLE' ? 'success' : 'secondary'}>
                      {puesto.estado}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>{puesto.distancia_cm ?? '-'}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ListaPuestos