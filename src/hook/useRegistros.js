import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const useRegistros = () => {
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarRegistros = useCallback(async () => {
    setCargando(true)
    setError('')

    const { data, error: errorSupabase } = await supabase
      .from('registros_estacionamiento')
      .select('*')
      .order('fecha_entrada', { ascending: false })

    if (errorSupabase) {
      setRegistros([])
      setError(errorSupabase.message)
    } else {
      setRegistros(data ?? [])
    }

    setCargando(false)
  }, [])

  useEffect(() => {
    cargarRegistros()
  }, [cargarRegistros])

  return {
    registros,
    cargando,
    error,
    recargar: cargarRegistros,
  }
}