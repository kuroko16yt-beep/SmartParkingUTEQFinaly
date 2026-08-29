import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const usePuestos = () => {
  const [puestos, setPuestos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarPuestos = useCallback(async () => {
    setCargando(true)
    setError('')

    const { data, error: errorSupabase } = await supabase
      .from('puestos')
      .select('*')
      .order('columna', { ascending: true })
      .order('numero', { ascending: true })

    if (errorSupabase) {
      setPuestos([])
      setError(errorSupabase.message)
    } else {
      setPuestos(data ?? [])
    }

    setCargando(false)
  }, [])

  useEffect(() => {
    cargarPuestos()
  }, [cargarPuestos])

  return {
    puestos,
    cargando,
    error,
    recargar: cargarPuestos,
  }
}