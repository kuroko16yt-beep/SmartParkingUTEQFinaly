/**
 * Sidebar Navigation Configuration
 *
 * Defines the structure and content of the sidebar navigation menu.
 * Supports multiple navigation component types from CoreUI React:
 * - CNavItem: Single navigation link
 * - CNavGroup: Collapsible group of links
 * - CNavTitle: Section title/divider
 *
 * @module _nav
 */

import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilCarAlt, cilSpeedometer } from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [

  {
    component: CNavTitle,
    name: 'Parqueadero',
  },
  {
    component: CNavItem,
    name: 'Vehículos y propietarios',
    to: '/parqueadero/vehiculos',
    icon: <CIcon icon={cilCarAlt} customClassName="nav-icon" />,
  },
  {
  component: CNavItem,
  name: 'Puestos',
  to: '/parqueadero/puestos',
  icon: <CIcon icon={cilCarAlt} customClassName="nav-icon" />,
},
{
  component: CNavItem,
  name: 'Registros de estacionamiento',
  to: '/parqueadero/registros',
  icon: <CIcon icon={cilCarAlt} customClassName="nav-icon" />,
}
]

export default _nav