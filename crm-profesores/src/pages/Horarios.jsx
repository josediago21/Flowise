import { useState, useEffect } from 'react';
import { Clock, User, Calendar, Link as LinkIcon } from 'lucide-react';

const Horarios = () => {
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [clasesReservadas, setClasesReservadas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const diasSemana = [
    { id: 1, nombre: 'Lunes', short: 'LUN' },
    { id: 2, nombre: 'Martes', short: 'MAR' },
    { id: 3, nombre: 'Miércoles', short: 'MIE' },
    { id: 4, nombre: 'Jueves', short: 'JUE' },
    { id: 5, nombre: 'Viernes', short: 'VIE' },
    { id: 6, nombre: 'Sábado', short: 'SAB' },
    { id: 0, nombre: 'Domingo', short: 'DOM' }
  ];

  const horasPorDia = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [disponibilidadRes, clasesRes] = await Promise.all([
        fetch('http://localhost:3001/api/disponibilidad'),
        fetch('http://localhost:3001/api/clases/proximas')
      ]);

      if (disponibilidadRes.ok && clasesRes.ok) {
        const disponibilidadData = await disponibilidadRes.json();
        const clasesData = await clasesRes.json();
        
        setDisponibilidad(disponibilidadData);
        setClasesReservadas(clasesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDisponibilidad = async (diaSemana, hora) => {
    const horaFin = getHoraFin(hora);
    
    try {
      const existing = disponibilidad.find(d => 
        d.dia_semana === diaSemana && 
        d.hora_inicio === hora && 
        d.hora_fin === horaFin
      );

      const response = await fetch('http://localhost:3001/api/disponibilidad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dia_semana: diaSemana,
          hora_inicio: hora,
          hora_fin: horaFin,
          disponible: existing ? !existing.disponible : true
        }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating disponibilidad:', error);
    }
  };

  const getHoraFin = (horaInicio) => {
    const [hora] = horaInicio.split(':');
    return `${String(parseInt(hora) + 1).padStart(2, '0')}:00`;
  };

  const isDisponible = (diaSemana, hora) => {
    const horaFin = getHoraFin(hora);
    return disponibilidad.some(d => 
      d.dia_semana === diaSemana && 
      d.hora_inicio === hora && 
      d.hora_fin === horaFin && 
      d.disponible
    );
  };

  const getClaseReservada = (diaSemana, hora) => {
    const fecha = getDateForDay(diaSemana);
    return clasesReservadas.find(c => 
      c.fecha === fecha && 
      c.hora_inicio === hora
    );
  };

  const getDateForDay = (diaSemana) => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = diaSemana - currentDay;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    return targetDate.toISOString().split('T')[0];
  };

  const simulateReservaLink = (diaSemana, hora) => {
    const diaName = diasSemana.find(d => d.id === diaSemana)?.nombre;
    alert(`🔗 Link de reserva simulado para ${diaName} a las ${hora}:\n"https://mi-crm.com/reservar/${diaSemana}/${hora.replace(':', '')}\n\nEste enlace se enviaría al alumno por WhatsApp"`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Horarios</h1>
          <p className="text-gray-600">Administra tu disponibilidad semanal y clases reservadas</p>
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Leyenda</h3>
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 border rounded"></div>
            <span className="text-gray-600">No disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-gray-600">Disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span className="text-gray-600">Clase reservada</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Haz clic en las celdas para marcar/desmarcar tu disponibilidad
        </p>
      </div>

      {/* Calendario Semanal */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Horario Semanal</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora
                </th>
                {diasSemana.map(dia => (
                  <th key={dia.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    <div>{dia.short}</div>
                    <div className="text-xs text-gray-400 font-normal">{dia.nombre}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {horasPorDia.map(hora => (
                <tr key={hora}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                    {hora}
                  </td>
                  {diasSemana.map(dia => {
                    const claseReservada = getClaseReservada(dia.id, hora);
                    const disponible = isDisponible(dia.id, hora);
                    
                    return (
                      <td key={`${dia.id}-${hora}`} className="px-2 py-3 text-center">
                        {claseReservada ? (
                          // Clase reservada
                          <div className="bg-blue-100 border border-blue-300 rounded p-2 text-xs">
                            <div className="font-medium text-blue-900">
                              {claseReservada.alumno_nombre}
                            </div>
                            <div className="text-blue-700">
                              {claseReservada.materia}
                            </div>
                          </div>
                        ) : disponible ? (
                          // Disponible - puede enviarse como link
                          <div className="relative">
                            <button
                              onClick={() => toggleDisponibilidad(dia.id, hora)}
                              className="w-full bg-green-100 border border-green-300 rounded p-2 text-xs hover:bg-green-200 transition-colors"
                            >
                              <Clock className="h-4 w-4 mx-auto text-green-600" />
                            </button>
                            <button
                              onClick={() => simulateReservaLink(dia.id, hora)}
                              className="absolute top-0 right-0 -mt-1 -mr-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 transition-colors"
                              title="Enviar link de reserva"
                            >
                              <LinkIcon className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          // No disponible
                          <button
                            onClick={() => toggleDisponibilidad(dia.id, hora)}
                            className="w-full bg-gray-100 border border-gray-300 rounded p-2 text-xs hover:bg-gray-200 transition-colors"
                          >
                            <X className="h-4 w-4 mx-auto text-gray-400" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Próximas Clases */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Próximas Clases Confirmadas</h2>
        </div>
        
        <div className="p-6">
          {clasesReservadas.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay clases confirmadas esta semana</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clasesReservadas.map((clase) => (
                <div key={clase.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{clase.alumno_nombre}</h3>
                      <p className="text-sm text-gray-600">{clase.materia}</p>
                    </div>
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    <p className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(clase.fecha).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'short' 
                      })}</span>
                    </p>
                    <p className="flex items-center space-x-1 mt-1">
                      <Clock className="h-4 w-4" />
                      <span>{clase.hora_inicio} - {clase.hora_fin || 'Sin hora fin'}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Cómo usar el calendario</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Haz clic en las celdas para marcar tu disponibilidad</p>
          <p>• Las franjas verdes están disponibles para nuevas reservas</p>
          <p>• Usa el botón 🔗 para generar un link de reserva para el alumno</p>
          <p>• Las clases azules ya están confirmadas</p>
        </div>
      </div>
    </div>
  );
};

const X = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default Horarios;