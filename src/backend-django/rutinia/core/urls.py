from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, ToolViewSet, RolViewSet, HabitoViewSet, CategoriaViewSet, RegistroHabitoViewSet
from .authentication import register, login, refresh_token, get_user_info, logout
from django.urls import path, include

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'roles', RolViewSet, basename="rol")
router.register(r'tools', ToolViewSet, basename='tool')
router.register(r'categorias', CategoriaViewSet, basename='categoria')
router.register(r'habitos', HabitoViewSet, basename="habito")
router.register(r'registros', RegistroHabitoViewSet, basename='registro')

urlpatterns = [
    path('', include(router.urls)),
    # Endpoints de autenticación
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/refresh/', refresh_token, name='refresh_token'),
    path('auth/user/', get_user_info, name='user_info'),
    path('auth/logout/', logout, name='logout'),
]