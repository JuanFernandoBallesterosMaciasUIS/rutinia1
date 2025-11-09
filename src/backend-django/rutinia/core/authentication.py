from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password
from core.models import Usuario
import mongoengine


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Registrar un nuevo usuario
    """
    try:
        data = request.data
        
        # Validar datos requeridos
        required_fields = ['nombre', 'correo', 'contrasena']
        for field in required_fields:
            if field not in data:
                return Response(
                    {'error': f'El campo {field} es requerido'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Verificar si el correo ya existe
        if Usuario.objects(correo=data['correo']).first():
            return Response(
                {'error': 'El correo ya está registrado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear el usuario
        usuario = Usuario(
            nombre=data['nombre'],
            apellido=data.get('apellido', ''),
            correo=data['correo'],
            clave=make_password(data['contrasena']),
            tema=data.get('tema', 'light'),
            rol=None  # Ajustar según tu lógica de roles
        )
        usuario.save()
        
        # Generar tokens JWT
        refresh = RefreshToken()
        refresh['user_id'] = str(usuario.id)
        refresh['correo'] = usuario.correo
        refresh['nombre'] = usuario.nombre
        
        return Response({
            'message': 'Usuario creado exitosamente',
            'user': {
                'id': str(usuario.id),
                'nombre': usuario.nombre,
                'apellido': usuario.apellido,
                'correo': usuario.correo,
                'tema': usuario.tema
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Iniciar sesión
    """
    try:
        data = request.data
        
        # Validar datos requeridos
        if 'correo' not in data or 'contrasena' not in data:
            return Response(
                {'error': 'Correo y contraseña son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Buscar usuario
        usuario = Usuario.objects(correo=data['correo']).first()
        
        if not usuario:
            return Response(
                {'error': 'Credenciales inválidas'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Verificar contraseña
        if not check_password(data['contrasena'], usuario.clave):
            return Response(
                {'error': 'Credenciales inválidas'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generar tokens JWT
        refresh = RefreshToken()
        refresh['user_id'] = str(usuario.id)
        refresh['correo'] = usuario.correo
        refresh['nombre'] = usuario.nombre
        
        return Response({
            'message': 'Login exitoso',
            'user': {
                'id': str(usuario.id),
                'nombre': usuario.nombre,
                'apellido': usuario.apellido,
                'correo': usuario.correo,
                'tema': usuario.tema
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """
    Refrescar el token de acceso
    """
    try:
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response(
                {'error': 'Token de refresco es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        refresh = RefreshToken(refresh_token)
        
        return Response({
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'Token inválido o expirado'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    """
    Obtener información del usuario autenticado
    """
    try:
        # El token JWT contiene el user_id
        user_id = request.user_id if hasattr(request, 'user_id') else None
        
        if not user_id:
            # Intentar extraer del token manualmente
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                from rest_framework_simplejwt.tokens import AccessToken
                access_token = AccessToken(token)
                user_id = access_token['user_id']
        
        if not user_id:
            return Response(
                {'error': 'No se pudo identificar al usuario'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        usuario = Usuario.objects(id=user_id).first()
        
        if not usuario:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'id': str(usuario.id),
            'nombre': usuario.nombre,
            'apellido': usuario.apellido,
            'correo': usuario.correo,
            'tema': usuario.tema
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Cerrar sesión (opcionalmente invalidar el token)
    """
    try:
        # En una implementación completa, aquí se podría añadir
        # el token a una lista negra
        return Response({
            'message': 'Sesión cerrada exitosamente'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
