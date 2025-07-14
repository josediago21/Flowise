import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Calendar, Clock, User } from 'lucide-react';
import AddAlumnoModal from '../components/AddAlumnoModal';

const Dashboard = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [clasesProximas, setClasesProximas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [alumnosRes, clasesRes] = await Promise.all([
        fetch('http://localhost:3001/api/alumnos'),
        fetch('http://localhost:3001/api/clases/proximas')
      ]);

      if (alumnosRes.ok && clasesRes.ok) {
        const alumnosData = await alumnosRes.json();
        const clasesData = await clasesRes.json();
        setAlumnos(alumnosData);
        setClasesProximas(clasesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (fecha, hora) => {
    if (!fecha || !hora) return '';
    const dateTime = new Date(`${fecha}T${hora}`);
    return dateTime.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatus = (estado) => {
    switch (estado) {
      case 'pagado':
        return { color: 'text-green-700 bg-green-100', text: 'Pagado' };
      case 'pendiente':
        return { color: 'text-yellow-700 bg-yellow-100', text: 'Pendiente' };
      default:
        return { color: 'text-gray-700 bg-gray-100', text: 'Sin definir' };
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Gestiona tus alumnos y clases</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Añadir Alumno</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Alumnos</p>
              <p className="text-2xl font-bold text-gray-900">{alumnos.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clases esta semana</p>
              <p className="text-2xl font-bold text-gray-900">{clasesProximas.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pagos pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {alumnos.filter(a => a.estado_pago === 'pendiente').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Alumnos */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Mis Alumnos</h2>
          </div>
          <div className="p-6">
            {alumnos.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay alumnos registrados</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Añadir tu primer alumno
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {alumnos.map((alumno) => {
                  const paymentStatus = getPaymentStatus(alumno.estado_pago);
                  return (
                    <Link
                      key={alumno.id}
                      to={`/alumno/${alumno.id}`}
                      className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{alumno.nombre}</h3>
                          <p className="text-sm text-gray-600">{alumno.materia}</p>
                          {alumno.proxima_clase && (
                            <p className="text-xs text-blue-600 mt-1">
                              Próxima clase: {formatDateTime(alumno.proxima_clase.split(' ')[0], alumno.proxima_clase.split(' ')[1])}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatus.color}`}>
                          {paymentStatus.text}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Clases Próximas */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Próximas Clases (7 días)</h2>
          </div>
          <div className="p-6">
            {clasesProximas.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay clases programadas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clasesProximas.map((clase) => (
                  <div key={clase.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{clase.alumno_nombre}</h3>
                        <p className="text-sm text-gray-600">{clase.materia}</p>
                        <p className="text-sm text-blue-600">
                          {formatDateTime(clase.fecha, clase.hora_inicio)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para añadir alumno */}
      <AddAlumnoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
};

export default Dashboard;