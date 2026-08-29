/**
 * Application Routes Configuration
 *
 * Rutas de UTEQ Smart Parking. Se conservó únicamente el Dashboard de
 * la plantilla y se agregó la vista de administración de vehículos y
 * propietarios del caso de estudio.
 *
 * @module routes
 */

import React from 'react'

// Dashboard
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// Parqueadero
const ListaVehiculos = React.lazy(() => import('./views/parqueadero/ListaVehiculos'))

const ListaPuestos = React.lazy(() => import('./views/parqueadero/ListaPuestos'))
const ListaRegistros = React.lazy(() => import('./views/parqueadero/ListaRegistros'))

export const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  {
    path: '/parqueadero/vehiculos',
    name: 'Vehículos y propietarios',
    element: ListaVehiculos,
  },
  {
  path: '/parqueadero/puestos',
  name: 'Puestos',
  element: ListaPuestos,
},
{
  path: '/parqueadero/registros',
  name: 'Registros de estacionamiento',
  element: ListaRegistros,
}
]

export default routes