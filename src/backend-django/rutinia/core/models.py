from django.db import models

# Create your models here.
from mongoengine import (
    Document, EmbeddedDocument, fields, CASCADE, NULLIFY
)


# --- Rol ---
class Rol(Document):
    nombre = fields.StringField(max_length=20, unique=True)

    def __str__(self):
        return self.nombre

# --- Usuario ---
class Usuario(Document):
    nombre = fields.StringField(max_length=50)
    apellido = fields.StringField(max_length=50)
    correo = fields.EmailField(max_length=100, unique=True)
    clave = fields.StringField(max_length=100)
    tema = fields.StringField(max_length=20)
    rol = fields.ReferenceField(Rol)

    def __str__(self):
        return f"{self.nombre} {self.apellido}"

# --- Categoría ---
class Categoria(Document):
    nombre = fields.StringField(max_length=50)

# --- Notificación (configuración de hora en hábito) ---
class Notificacion(EmbeddedDocument):
    hora = fields.StringField(max_length=5)  # Formato: "HH:MM" (ej: "09:00", "14:30")
    activa = fields.BooleanField(default=True)

# --- Hábito ---
class Habito(Document):
    usuario = fields.ReferenceField(Usuario, reverse_delete_rule=CASCADE)
    categoria = fields.ReferenceField(Categoria, reverse_delete_rule=NULLIFY)
    nombre = fields.StringField(max_length=50)
    descripcion = fields.StringField(max_length=100)
    dificultad = fields.StringField(max_length=50)
    fecha_inicio = fields.DateField()
    tipo_frecuencia = fields.StringField(max_length=50)
    # DynamicField permite tanto strings (días de semana) como números (días del mes)
    dias = fields.ListField(fields.DynamicField(), required=False)
    publico = fields.BooleanField(default=False)
    activo = fields.BooleanField(default=True)
    notificaciones = fields.EmbeddedDocumentListField(Notificacion)
    icono = fields.StringField(max_length=50)
    color = fields.StringField(max_length=20)


# --- Registro de Hábito ---
class RegistroHabito(Document):
    habito = fields.ReferenceField(Habito, reverse_delete_rule=CASCADE)
    fecha = fields.DateField()
    estado = fields.BooleanField()


class ToolInput(EmbeddedDocument):
    name = fields.StringField(required=True)
    value = fields.DynamicField(required=True)

class Tool(Document):
    label = fields.StringField(required=True)
    description = fields.StringField(required=True, null=True)
    inputs = fields.ListField(fields.EmbeddedDocumentField(ToolInput))




# --- Historial de Notificaciones (notificaciones enviadas) ---
class HistorialNotificacion(Document):
    usuario = fields.ReferenceField(Usuario, reverse_delete_rule=CASCADE)
    habito = fields.ReferenceField(Habito, reverse_delete_rule=CASCADE)
    titulo = fields.StringField(max_length=100)
    mensaje = fields.StringField(max_length=200)
    fecha_hora = fields.DateTimeField()
    leida = fields.BooleanField(default=False)
    fecha_lectura = fields.DateTimeField(required=False)