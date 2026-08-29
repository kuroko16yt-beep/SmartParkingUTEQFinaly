export const TIPOS_VEHICULO = ['AUTOMOVIL', 'CAMIONETA', 'SUV', 'MOTOCICLETA']

export const VALORES_INICIALES = {
  placa: '',
  marca: '',
  modelo: '',
  anio: new Date().getFullYear(),
  color: '',
  tipo: 'AUTOMOVIL',
  foto_url: '',
  foto_fuente_url: '',
  foto_propietario_url: '',
  cedula_propietario: '',
  propietario_nombre: '',
  correo_institucional: '',
  correo_microsoft: '',
  autorizado: true,
}

const REGEX_PLACA = /^[A-Z]{3}-\d{4}$/
const REGEX_CEDULA = /^\d{10}$/
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGEX_URL = /^https?:\/\/.+/i

// Devuelve un objeto { campo: mensaje } solo con los campos inválidos.
export const validarVehiculo = (valores) => {
  const errores = {}

  if (!REGEX_PLACA.test(valores.placa?.trim() ?? '')) {
    errores.placa = 'Formato de placa ecuatoriana inválido. Debe ser AAA-1234.'
  }

  if (!valores.marca?.trim()) {
    errores.marca = 'La marca es obligatoria.'
  }

  if (!valores.modelo?.trim()) {
    errores.modelo = 'El modelo es obligatorio.'
  }

  const anio = Number(valores.anio)
  if (!Number.isInteger(anio) || anio < 1990 || anio > 2035) {
    errores.anio = 'El año debe ser un número entre 1990 y 2035.'
  }

  if (!valores.color?.trim()) {
    errores.color = 'El color es obligatorio.'
  }

  if (!TIPOS_VEHICULO.includes(valores.tipo)) {
    errores.tipo = 'Selecciona un tipo de vehículo válido.'
  }

  if (!REGEX_URL.test(valores.foto_url?.trim() ?? '')) {
    errores.foto_url = 'Ingresa una URL válida (http:// o https://) para la foto del vehículo.'
  }

  if (!REGEX_URL.test(valores.foto_fuente_url?.trim() ?? '')) {
    errores.foto_fuente_url = 'Ingresa una URL válida para la fuente de la foto.'
  }

  if (!REGEX_URL.test(valores.foto_propietario_url?.trim() ?? '')) {
    errores.foto_propietario_url = 'Ingresa una URL válida para la foto del propietario.'
  }

  if (!REGEX_CEDULA.test(valores.cedula_propietario?.trim() ?? '')) {
    errores.cedula_propietario = 'La cédula debe tener exactamente 10 dígitos numéricos.'
  }

  if (!valores.propietario_nombre?.trim()) {
    errores.propietario_nombre = 'El nombre del propietario es obligatorio.'
  }

  if (!REGEX_CORREO.test(valores.correo_institucional?.trim() ?? '')) {
    errores.correo_institucional = 'Ingresa un correo institucional válido.'
  }

  if (valores.correo_microsoft?.trim() && !REGEX_CORREO.test(valores.correo_microsoft.trim())) {
    errores.correo_microsoft = 'El correo de Microsoft no tiene un formato válido.'
  }

  return errores
}

// Normaliza los valores antes de enviarlos a Supabase (mayúsculas en
// placa, recorte de espacios, año numérico, correo opcional vacío -> null).
export const normalizarVehiculo = (valores) => ({
  placa: valores.placa.trim().toUpperCase(),
  marca: valores.marca.trim(),
  modelo: valores.modelo.trim(),
  anio: Number(valores.anio),
  color: valores.color.trim(),
  tipo: valores.tipo,
  foto_url: valores.foto_url.trim(),
  foto_fuente_url: valores.foto_fuente_url.trim(),
  foto_propietario_url: valores.foto_propietario_url.trim(),
  cedula_propietario: valores.cedula_propietario.trim(),
  propietario_nombre: valores.propietario_nombre.trim(),
  correo_institucional: valores.correo_institucional.trim(),
  correo_microsoft: valores.correo_microsoft?.trim() || null,
  autorizado: Boolean(valores.autorizado),
})
