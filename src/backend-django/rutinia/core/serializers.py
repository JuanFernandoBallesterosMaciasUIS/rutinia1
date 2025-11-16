from rest_framework import serializers
from rest_framework_mongoengine import serializers as mon

from .models import Usuario, Habito, RegistroHabito, Rol, Categoria, Notificacion, HistorialNotificacion, Tool

class ToolSerializer(mon.DocumentSerializer):
    class Meta:
        model = Tool
        fields = '__all__'

class RolSerializer(mon.DocumentSerializer):
    class Meta:
        model = Rol
        fields = '__all__'


class UsuarioSerializer(mon.DocumentSerializer):
    rol = mon.serializers.CharField(required=False)  # se puede omitir si no cambia

    class Meta:
        model = Usuario
        fields = '__all__'

    def to_representation(self, instance):
        # Muestra el rol completo al hacer GET
        data = super().to_representation(instance)
        if instance.rol:
            data['rol'] = RolSerializer(instance.rol).data
        return data

    def update(self, instance, validated_data):
        """
        Permite actualizar el usuario y manejar correctamente el campo 'rol'
        que llega como un id en el cuerpo del request.
        """
        rol_id = validated_data.pop('rol', None)

        # Si se envía un rol, busca el objeto correspondiente
        if rol_id:
            try:
                rol_obj = Rol.objects.get(id=rol_id)
                instance.rol = rol_obj
            except Rol.DoesNotExist:
                raise serializers.ValidationError({'rol': 'El rol especificado no existe.'})

        # Actualiza los demás campos normalmente
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
    
    

"""
class RolSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    nombre = serializers.CharField(max_length=20)
"""


"""
class UsuarioSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    nombre = serializers.CharField()
    apellido = serializers.CharField()
    correo = serializers.EmailField()
    clave = serializers.CharField()
    tema = serializers.CharField()
    rol = serializers.PrimaryKeyRelatedField(queryset=Rol.objects)
    
    def to_representation(self, instance):
        #Convierte el ObjectId en string para que sea serializable
        rep = super().to_representation(instance)
        rep['id'] = str(instance.id)
        rep['rol'] = str(instance.rol.id) if instance.rol else None
        return rep

"""

class NotificacionSerializer(mon.EmbeddedDocumentSerializer):
    class Meta:
        model = Notificacion
        fields = ['hora', 'activa']

class HistorialNotificacionSerializer(mon.DocumentSerializer):
    class Meta:
        model = HistorialNotificacion
        fields = '__all__'
    
    def to_representation(self, instance):
        """Incluye información básica del hábito"""
        data = super().to_representation(instance)
        
        if instance.usuario:
            data['usuario'] = str(instance.usuario.id)
        
        if instance.habito:
            data['habito'] = {
                'id': str(instance.habito.id),
                'nombre': instance.habito.nombre,
                'icono': instance.habito.icono if hasattr(instance.habito, 'icono') else 'fitness_center',
                'color': instance.habito.color if hasattr(instance.habito, 'color') else 'blue'
            }
        
        return data

class CategoriaSerializer(mon.DocumentSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class HabitoSerializer(mon.DocumentSerializer):
    notificaciones = NotificacionSerializer(many=True, required=False)
    categoria = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = Habito
        fields = '__all__'

    def _get_or_create_categoria(self, categoria_nombre):
        """Buscar o crear categoría por nombre"""
        if not categoria_nombre or categoria_nombre.strip() == '':
            return None
        
        # Buscar categoría existente (insensible a mayúsculas/minúsculas)
        try:
            categoria = Categoria.objects.get(nombre__iexact=categoria_nombre)
            return categoria
        except Categoria.DoesNotExist:
            # Crear nueva categoría si no existe
            categoria = Categoria(nombre=categoria_nombre.lower())
            categoria.save()
            return categoria

    def create(self, validated_data):
        """Crear hábito con notificaciones embebidas y categoría"""
        notificaciones_data = validated_data.pop('notificaciones', [])
        categoria_nombre = validated_data.pop('categoria', None)
        
        # Resolver categoría
        if categoria_nombre:
            validated_data['categoria'] = self._get_or_create_categoria(categoria_nombre)
        
        # Crear el hábito
        habito = Habito(**validated_data)
        
        # Agregar notificaciones como objetos Notificacion
        if notificaciones_data:
            habito.notificaciones = [
                Notificacion(**notif_data) for notif_data in notificaciones_data
            ]
        
        habito.save()
        return habito
    
    def update(self, instance, validated_data):
        """Actualizar hábito con notificaciones embebidas y categoría"""
        notificaciones_data = validated_data.pop('notificaciones', None)
        categoria_nombre = validated_data.pop('categoria', None)
        
        # Resolver categoría si se proporciona
        if categoria_nombre is not None:
            instance.categoria = self._get_or_create_categoria(categoria_nombre)
        
        # Actualizar campos básicos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Actualizar notificaciones si se proporcionaron
        if notificaciones_data is not None:
            instance.notificaciones = [
                Notificacion(**notif_data) for notif_data in notificaciones_data
            ]
        
        instance.save()
        return instance

    def to_representation(self, instance):
        """
        Muestra información básica de usuario y categoría.
        Evita serialización circular que causa error 500.
        """
        data = super().to_representation(instance)
        
        # Solo incluir ID del usuario (no el objeto completo)
        if instance.usuario:
            data['usuario'] = str(instance.usuario.id)
        
        # Devolver solo el nombre de la categoría (no el objeto completo)
        if instance.categoria:
            data['categoria'] = instance.categoria.nombre
        else:
            data['categoria'] = None
        
        # Asegurar que las notificaciones se serialicen correctamente
        if instance.notificaciones:
            data['notificaciones'] = NotificacionSerializer(instance.notificaciones, many=True).data
        else:
            data['notificaciones'] = []
        
        return data

class RegistroHabitoSerializer(mon.DocumentSerializer):
    class Meta:
        model = RegistroHabito
        fields = '__all__'
    
    def to_representation(self, instance):
        """
        Solo incluye información básica del hábito.
        Evita incluir el hábito completo con usuario, etc.
        """
        data = super().to_representation(instance)
        if instance.habito:
            # Solo incluir datos básicos del hábito
            data['habito'] = {
                'id': str(instance.habito.id),
                'nombre': instance.habito.nombre,
                'icono': instance.habito.icono if hasattr(instance.habito, 'icono') else 'fitness_center',
                'color': instance.habito.color if hasattr(instance.habito, 'color') else 'blue'
            }
        return data