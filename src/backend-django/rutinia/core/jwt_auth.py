"""
Autenticador JWT personalizado para MongoDB/MongoEngine.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from bson import ObjectId


class MongoJWTAuthentication(JWTAuthentication):
    """
    Autenticador JWT personalizado para MongoDB/MongoEngine.
    Simple JWT espera un modelo Django User con ID numérico,
    pero nosotros usamos Usuario de MongoDB con ObjectId.
    """
    
    def get_user(self, validated_token):
        """
        Obtiene el usuario desde MongoDB usando el ObjectId del token.
        """
        try:
            # Importar aquí para evitar circular imports
            from core.models import Usuario
            
            user_id = validated_token.get('user_id')
            if not user_id:
                raise InvalidToken('Token no contiene user_id')
            
            # Buscar usuario en MongoDB
            usuario = Usuario.objects(id=ObjectId(user_id)).first()
            
            if not usuario:
                raise InvalidToken('Usuario no encontrado')
            
            # Retornar el usuario de MongoDB
            # Simple JWT espera un objeto con ciertos atributos
            # Agregar atributos necesarios para compatibilidad
            usuario.is_authenticated = True
            usuario.is_active = True
            
            return usuario
            
        except Exception as e:
            raise InvalidToken(f'Error al obtener usuario: {str(e)}')
