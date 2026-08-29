import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Columnas visibles en el panel administrativo. Incluyen la cédula
// completa y el correo de Microsoft porque el formulario de edición
// los necesita para no perderlos al guardar (ver
// supabase_parqueadero_uteq_crud_rls.sql).
const COLUMNAS_ADMIN = `
  id,
  placa,
  marca,
  modelo,
  anio,
  color,
  tipo,
  foto_url,
  foto_fuente_url,
  foto_propietario_url,
  cedula_propietario,
  cedula_enmascarada,
  propietario_nombre,
  correo_institucional,
  correo_microsoft,
  autorizado,
  created_at
`

// Traduce los errores más comunes de Postgres/Supabase a mensajes
// entendibles para quien usa el formulario.
const mensajeDeError = (error) => {
  if (!error) return ''

  if (error.code === '23505') {
    if (error.message?.includes('placa')) {
      return 'Ya existe un vehículo registrado con esa placa.'
    }
    if (error.message?.includes('cedula')) {
      return 'Ya existe un propietario registrado con esa cédula.'
    }
    return 'Ya existe un registro con esos datos (placa o cédula duplicada).'
  }

  if (error.code === '23514') {
    return 'Uno de los datos no cumple con el formato requerido (placa, cédula, año o tipo de vehículo).'
  }

  return error.message || 'Ocurrió un error inesperado al comunicarse con Supabase.'
}

export const useVehiculos = () => {
  const [vehiculos, setVehiculos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState('')

  const cargarVehiculos = useCallback(async () => {
    setCargando(true)
    setError('')

    const { data, error: errorSupabase } = await supabase
      .from('vehiculos')
      .select(COLUMNAS_ADMIN)
      .order('propietario_nombre', { ascending: true })

    if (errorSupabase) {
      setVehiculos([])
      setError(mensajeDeError(errorSupabase))
    } else {
      setVehiculos(data ?? [])
    }

    setCargando(false)
  }, [])

  useEffect(() => {
    cargarVehiculos()
  }, [cargarVehiculos])

  // Crea un vehículo + propietario nuevo.
  const crearVehiculo = useCallback(async (valores) => {
    setGuardando(true)

    const { data, error: errorSupabase } = await supabase
      .from('vehiculos')
      .insert(valores)
      .select(COLUMNAS_ADMIN)
      .single()

    setGuardando(false)

    if (errorSupabase) {
      return { exito: false, mensaje: mensajeDeError(errorSupabase) }
    }

    setVehiculos((actuales) =>
      [...actuales, data].sort((a, b) =>
        a.propietario_nombre.localeCompare(b.propietario_nombre),
      ),
    )

    return { exito: true, mensaje: `Vehículo ${data.placa} registrado correctamente.` }
  }, [])

  // Actualiza un vehículo + propietario existente.
  const actualizarVehiculo = useCallback(async (id, valores) => {
    setGuardando(true)

    const { data, error: errorSupabase } = await supabase
      .from('vehiculos')
      .update(valores)
      .eq('id', id)
      .select(COLUMNAS_ADMIN)
      .single()

    setGuardando(false)

    if (errorSupabase) {
      return { exito: false, mensaje: mensajeDeError(errorSupabase) }
    }

    setVehiculos((actuales) => actuales.map((vehiculo) => (vehiculo.id === id ? data : vehiculo)))

    return { exito: true, mensaje: `Vehículo ${data.placa} actualizado correctamente.` }
  }, [])

  // Elimina un vehículo + propietario.
  const eliminarVehiculo = useCallback(async (vehiculo) => {
    setEliminando(true)

    const { error: errorSupabase } = await supabase
      .from('vehiculos')
      .delete()
      .eq('id', vehiculo.id)

    setEliminando(false)

    if (errorSupabase) {
      return { exito: false, mensaje: mensajeDeError(errorSupabase) }
    }

    setVehiculos((actuales) => actuales.filter((item) => item.id !== vehiculo.id))

    return { exito: true, mensaje: `Vehículo ${vehiculo.placa} eliminado correctamente.` }
  }, [])

  return {
    vehiculos,
    cargando,
    guardando,
    eliminando,
    error,
    recargar: cargarVehiculos,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo,
  }
}
