import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Upload, 
  MessageCircle, 
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';

const AlumnoDetail = () => {
  const { id } = useParams();
  const [alumno, setAlumno] = useState(null);
  const [clases, setClases] = useState([]);
  const [dudas, setDudas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  
  // Estados para modales
  const [showClaseModal, setShowClaseModal] = useState(false);
  const [showDudaModal, setShowDudaModal] = useState(false);
  
  // Form states
  const [claseForm, setClaseForm] = useState({
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    notas: '',
    archivo: null
  });
  
  const [dudaForm, setDudaForm] = useState({
    pregunta: '',
    respuesta: ''
  });

  useEffect(() => {
    if (id) {
      fetchAlumnoData();
    }
  }, [id]);

  const fetchAlumnoData = async () => {
    try {
      const [alumnoRes, clasesRes, dudasRes] = await Promise.all([
        fetch(`http://localhost:3001/api/alumnos/${id}`),
        fetch(`http://localhost:3001/api/alumnos/${id}/clases`),
        fetch(`http://localhost:3001/api/alumnos/${id}/dudas`)
      ]);

      if (alumnoRes.ok && clasesRes.ok && dudasRes.ok) {
        const alumnoData = await alumnoRes.json();
        const clasesData = await clasesRes.json();
        const dudasData = await dudasRes.json();
        
        setAlumno(alumnoData);
        setEditData(alumnoData);
        setClases(clasesData);
        setDudas(dudasData);
      }
    } catch (error) {
      console.error('Error fetching alumno data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAlumno = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/alumnos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        setAlumno(editData);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating alumno:', error);
    }
  };

  const handleAddClase = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('alumno_id', id);
      formData.append('fecha', claseForm.fecha);
      formData.append('hora_inicio', claseForm.hora_inicio);
      formData.append('hora_fin', claseForm.hora_fin);
      formData.append('notas', claseForm.notas);
      if (claseForm.archivo) {
        formData.append('archivo', claseForm.archivo);
      }

      const response = await fetch('http://localhost:3001/api/clases', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setClaseForm({
          fecha: '',
          hora_inicio: '',
          hora_fin: '',
          notas: '',
          archivo: null
        });
        setShowClaseModal(false);
        fetchAlumnoData();
      }
    } catch (error) {
      console.error('Error adding clase:', error);
    }
  };

  const handleAddDuda = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/dudas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alumno_id: id,
          ...dudaForm
        }),
      });

      if (response.ok) {
        setDudaForm({ pregunta: '', respuesta: '' });
        setShowDudaModal(false);
        fetchAlumnoData();
      }
    } catch (error) {
      console.error('Error adding duda:', error);
    }
  };

  const simulateWhatsAppSend = () => {
    alert('📱 Enlace de WhatsApp simulado: "¡Hola! Te envío el resumen de nuestra última clase..."');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!alumno) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Alumno no encontrado</p>
        <Link to="/" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{alumno.nombre}</h1>
            <p className="text-gray-600">{alumno.materia} - {alumno.nivel}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {editMode ? (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 mr-2 inline" />
                Cancelar
              </button>
              <button
                onClick={handleSaveAlumno}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Save className="h-4 w-4 mr-2 inline" />
                Guardar
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Edit className="h-4 w-4 mr-2 inline" />
              Editar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Alumno */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Información del Alumno</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.contacto || ''}
                  onChange={(e) => setEditData({...editData, contacto: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <p className="text-gray-900">{alumno.contacto || 'No especificado'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objetivos</label>
              {editMode ? (
                <textarea
                  value={editData.objetivos || ''}
                  onChange={(e) => setEditData({...editData, objetivos: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <p className="text-gray-900">{alumno.objetivos || 'No especificados'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado de Pago</label>
              {editMode ? (
                <select
                  value={editData.estado_pago || 'pendiente'}
                  onChange={(e) => setEditData({...editData, estado_pago: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="pagado">Pagado</option>
                </select>
              ) : (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  alumno.estado_pago === 'pagado' 
                    ? 'text-green-700 bg-green-100' 
                    : 'text-yellow-700 bg-yellow-100'
                }`}>
                  {alumno.estado_pago === 'pagado' ? 'Pagado' : 'Pendiente'}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temario</label>
              {editMode ? (
                <textarea
                  value={editData.temario || ''}
                  onChange={(e) => setEditData({...editData, temario: e.target.value})}
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Escribe aquí el temario compartido..."
                />
              ) : (
                <div className="text-gray-900 whitespace-pre-wrap">
                  {alumno.temario || 'No hay temario definido'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clases y Dudas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Seguimiento de Clases */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Seguimiento de Clases</h2>
              <button
                onClick={() => setShowClaseModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Añadir Clase</span>
              </button>
            </div>
            
            <div className="p-6">
              {clases.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay clases registradas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clases.map((clase) => (
                    <div key={clase.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {formatDate(clase.fecha)} - {clase.hora_inicio}
                            {clase.hora_fin && ` a ${clase.hora_fin}`}
                          </h3>
                        </div>
                        <button
                          onClick={simulateWhatsAppSend}
                          className="text-green-600 hover:text-green-700 text-sm flex items-center space-x-1"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>Enviar por WhatsApp</span>
                        </button>
                      </div>
                      
                      {clase.notas && (
                        <p className="text-gray-700 mb-2">{clase.notas}</p>
                      )}
                      
                      {clase.archivo_pdf && (
                        <div className="flex items-center space-x-2 text-sm text-blue-600">
                          <FileText className="h-4 w-4" />
                          <a 
                            href={`http://localhost:3001/uploads/${clase.archivo_pdf}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Ver archivo adjunto
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dudas Resueltas */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Dudas Resueltas</h2>
              <button
                onClick={() => setShowDudaModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Añadir Duda</span>
              </button>
            </div>
            
            <div className="p-6">
              {dudas.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay dudas registradas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dudas.map((duda) => (
                    <div key={duda.id} className="border rounded-lg p-4">
                      <div className="mb-2">
                        <h4 className="font-medium text-gray-900">Pregunta:</h4>
                        <p className="text-gray-700">{duda.pregunta}</p>
                      </div>
                      {duda.respuesta && (
                        <div>
                          <h4 className="font-medium text-gray-900">Respuesta:</h4>
                          <p className="text-gray-700">{duda.respuesta}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(duda.fecha)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para añadir clase */}
      {showClaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Registrar Nueva Clase</h2>
              <button
                onClick={() => setShowClaseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddClase} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={claseForm.fecha}
                  onChange={(e) => setClaseForm({...claseForm, fecha: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora inicio *
                  </label>
                  <input
                    type="time"
                    value={claseForm.hora_inicio}
                    onChange={(e) => setClaseForm({...claseForm, hora_inicio: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora fin
                  </label>
                  <input
                    type="time"
                    value={claseForm.hora_fin}
                    onChange={(e) => setClaseForm({...claseForm, hora_fin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas de la clase
                </label>
                <textarea
                  value={claseForm.notas}
                  onChange={(e) => setClaseForm({...claseForm, notas: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="¿Qué se ha trabajado en esta clase?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subir PDF (captura de pizarra, etc.)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setClaseForm({...claseForm, archivo: e.target.files[0]})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowClaseModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                >
                  Registrar Clase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para añadir duda */}
      {showDudaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Registrar Nueva Duda</h2>
              <button
                onClick={() => setShowDudaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddDuda} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pregunta *
                </label>
                <textarea
                  value={dudaForm.pregunta}
                  onChange={(e) => setDudaForm({...dudaForm, pregunta: e.target.value})}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="¿Cuál era la duda del alumno?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Respuesta
                </label>
                <textarea
                  value={dudaForm.respuesta}
                  onChange={(e) => setDudaForm({...dudaForm, respuesta: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="¿Cómo se resolvió?"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDudaModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  Registrar Duda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumnoDetail;