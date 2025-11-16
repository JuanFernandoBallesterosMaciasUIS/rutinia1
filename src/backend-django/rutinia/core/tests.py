import unittest
from datetime import date, datetime
from mongoengine import connect, disconnect
import mongomock
from .models import Rol, Usuario, Categoria, Habito, RegistroHabito, Notificacion


class BaseTestCase(unittest.TestCase):
    """Configuración base para las pruebas con MongoEngine"""
    @classmethod
    def setUpClass(cls):
        # Crear cliente mongomock manualmente
        client = mongomock.MongoClient()
        
        # Forzar versión simulada para evitar conflicto con instalación real
        client.server_info = lambda: {"version": "5.0.0", "versionArray": [5, 0, 0]}
        
        # Conectar usando el cliente manual
        connect(
            'rutinia_test_db',
            host='mongodb://localhost',
            alias='default',
            mongo_client_class=lambda *args, **kwargs: client
        )

    @classmethod
    def tearDownClass(cls):
        disconnect()

# --- 1. Registrar usuario ---
class UsuarioTestCase(BaseTestCase):
    def setUp(self):
        Rol.objects.delete()
        Usuario.objects.delete()

        self.rol = Rol(nombre="Usuario").save()
        self.usuario_data = {
            "nombre": "Harold",
            "apellido": "Durán",
            "correo": "user@example.com",
            "clave": "123456",
            "tema": "oscuro",
            "rol": self.rol
        }

    def test_registrar_usuario(self):
        """Usuario: correo=user@example.com, contraseña=123456"""
        usuario = Usuario(**self.usuario_data).save()
        self.assertIsNotNone(usuario.id)

    def test_registrar_usuario_duplicado(self):
        """Usuario existente intenta registrarse otra vez"""
        Usuario(**self.usuario_data).save()
        with self.assertRaises(Exception):
            Usuario(**self.usuario_data).save()

    def test_login_usuario_valido(self):
        """Usuario válido: correo y clave correctos"""
        Usuario(**self.usuario_data).save()
        usuario = Usuario.objects.get(correo="user@example.com")
        self.assertEqual(usuario.clave, "123456")

    def test_login_usuario_invalido(self):
        """Usuario inválido: contraseña incorrecta"""
        Usuario(**self.usuario_data).save()
        usuario = Usuario.objects.get(correo="user@example.com")
        self.assertNotEqual(usuario.clave, "999999")


# --- 2. Crear hábitos ---
class HabitoTestCase(BaseTestCase):
    def setUp(self):
        Usuario.objects.delete()
        Categoria.objects.delete()
        Habito.objects.delete()

        self.usuario = Usuario(
            nombre="Harold",
            apellido="Durán",
            correo="harold@example.com",
            clave="123456",
            tema="oscuro"
        ).save()
        self.categoria = Categoria(nombre="Salud").save()

    def test_crear_habito_nombre_vacio(self):
        """Crear hábito: nombre vacío"""
        with self.assertRaises(Exception):
            Habito(
                usuario=self.usuario,
                categoria=self.categoria,
                nombre="",
                descripcion="Hábito sin nombre",
                dificultad="Baja",
                fecha_inicio=date.today(),
                tipo_frecuencia="Diario"
            ).save()

    def test_crear_habito_frecuencia_valida(self):
        """Crear hábito: frecuencia válida ('Semanal')"""
        habito = Habito(
            usuario=self.usuario,
            categoria=self.categoria,
            nombre="Leer",
            descripcion="Leer 10 páginas",
            dificultad="Media",
            fecha_inicio=date.today(),
            tipo_frecuencia="Semanal",
            publico=True,
            activo=True,
            notificaciones=[],
            icono="📖",
            color="verde"
        ).save()
        self.assertEqual(habito.tipo_frecuencia, "Semanal")


# --- 3. Registrar hábito completado / inexistente ---
class RegistroHabitoTestCase(BaseTestCase):
    def setUp(self):
        Usuario.objects.delete()
        Categoria.objects.delete()
        Habito.objects.delete()
        RegistroHabito.objects.delete()

        usuario = Usuario(
            nombre="Harold",
            apellido="Durán",
            correo="harold@example.com",
            clave="123456",
            tema="oscuro"
        ).save()
        categoria = Categoria(nombre="Productividad").save()
        self.habito = Habito(
            usuario=usuario,
            categoria=categoria,
            nombre="Ejercicio",
            descripcion="Hacer ejercicio diario",
            dificultad="Media",
            fecha_inicio=date.today(),
            tipo_frecuencia="Diario",
            publico=True,
            activo=True,
            notificaciones=[Notificacion(hora=datetime.now())],
            icono="🏃",
            color="azul"
        ).save()

    def test_registrar_habito_completado(self):
        """Registrar hábito completado"""
        registro = RegistroHabito(
            habito=self.habito,
            fecha=date.today(),
            estado=True
        ).save()
        self.assertTrue(registro.estado)

    def test_registrar_habito_inexistente(self):
        """Intentar registrar hábito inexistente"""
        with self.assertRaises(Exception):
            RegistroHabito(
                habito=None,
                fecha=date.today(),
                estado=True
            ).save()


# --- 4. Generar reportes (simulados) ---
class ReporteTestCase(BaseTestCase):
    def setUp(self):
        Usuario.objects.delete()
        Categoria.objects.delete()
        Habito.objects.delete()
        RegistroHabito.objects.delete()

        usuario = Usuario(
            nombre="Harold",
            apellido="Durán",
            correo="harold@example.com",
            clave="123456",
            tema="oscuro"
        ).save()
        categoria = Categoria(nombre="Lectura").save()
        self.habito = Habito(
            usuario=usuario,
            categoria=categoria,
            nombre="Leer",
            descripcion="Leer cada día",
            dificultad="Baja",
            fecha_inicio=date.today(),
            tipo_frecuencia="Diario"
        ).save()

    def test_generar_reporte_con_datos(self):
        """Generar reporte semanal con datos existentes"""
        RegistroHabito(
            habito=self.habito,
            fecha=date.today(),
            estado=True
        ).save()

        registros = RegistroHabito.objects(habito=self.habito)
        self.assertGreater(len(registros), 0)

    def test_generar_reporte_sin_datos(self):
        """Generar reporte sin datos"""
        registros = RegistroHabito.objects()
        self.assertEqual(len(registros), 0)


if __name__ == '__main__':
    unittest.main()
