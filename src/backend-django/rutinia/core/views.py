from django.shortcuts import render

#Librerias para el manejo de timepo y fechas
from datetime import datetime, timedelta, date
import calendar

# MongoDB ObjectId
from bson import ObjectId

# Create your views here.
#from rest_framework import viewsets, status
from rest_framework_mongoengine import viewsets
from rest_framework import status

#Librerias rest
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import Usuario, Habito, RegistroHabito, Rol, Categoria, Notificacion, Tool
from .serializers import UsuarioSerializer, RolSerializer, HabitoSerializer, CategoriaSerializer, RegistroHabitoSerializer, ToolSerializer, NotificacionSerializer

from .pagination import HabitoPagination


class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = [IsAuthenticated]


class UsuarioViewSet(viewsets.ModelViewSet):
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Usuario.objects.all()
        rol = self.request.query_params.get('rol')
        correo = self.request.query_params.get('correo')
        tema = self.request.query_params.get('tema')
        nombre = self.request.query_params.get('nombre')
        apellido = self.request.query_params.get('apellido')

        #Filtros
        if rol:
            queryset = queryset.filter(rol=rol)
        
        if correo:
            queryset = queryset.filter(correo__icontains=correo) #Para buscar por palabras similares
       
        if tema:
            queryset = queryset.filter(tema=tema)
      
        if nombre:
            queryset = queryset.filter(nombre__icontains=nombre)
     
        if apellido:
            queryset = queryset.filter(apellido__icontains=apellido)

        #Ordenamiento
        ordering = self.request.query_params.get('ordering')  
        if ordering:
            allowed_fields = ['nombre', 'correo', 'apellido', 'tema']
            field = ordering.lstrip('-')  # Quita el "-" si es descendente

            if field in allowed_fields:
                queryset = queryset.order_by(ordering)
            else:
                pass

        return queryset

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]

class RegistroHabitoViewSet(viewsets.ModelViewSet):
    #queryset = RegistroHabito.objects.all()
    serializer_class = RegistroHabitoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = RegistroHabito.objects.all()
        id_habito = self.request.query_params.get('habito')

        if id_habito:
            try:
                # Convertir string a ObjectId para MongoEngine
                habito_obj = Habito.objects.get(id=ObjectId(id_habito))
                queryset = queryset.filter(habito=habito_obj)
            except (Habito.DoesNotExist, Exception):
                # Si el hábito no existe o el ID es inválido, devolver queryset vacío
                return RegistroHabito.objects.none()
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def toggle_completado(self, request):
        """
        Marca o desmarca un hábito como completado para una fecha específica.
        Previene duplicados.
        
        Body: {
            "habito_id": "68ea57f5fc52f3058c8233ab",
            "fecha": "2025-10-12",
            "completado": true/false
        }
        """
        habito_id = request.data.get('habito_id')
        fecha_str = request.data.get('fecha')
        completado = request.data.get('completado', True)
        
        if not habito_id or not fecha_str:
            return Response(
                {"error": "Se requieren habito_id y fecha"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Parsear fecha
        try:
            fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"error": "Formato de fecha inválido. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Buscar hábito
        try:
            habito = Habito.objects.get(id=ObjectId(habito_id))
        except Habito.DoesNotExist:
            return Response(
                {"error": "Hábito no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Buscar o crear registro (prevenir duplicados)
        registro_existente = RegistroHabito.objects(
            habito=habito,
            fecha=fecha
        ).first()
        
        if registro_existente:
            # Actualizar registro existente
            registro_existente.estado = completado
            registro_existente.save()
            
            return Response({
                "mensaje": "Registro actualizado",
                "registro": {
                    "id": str(registro_existente.id),
                    "habito": habito.nombre,
                    "fecha": str(fecha),
                    "estado": completado
                }
            })
        else:
            # Crear nuevo registro
            nuevo_registro = RegistroHabito(
                habito=habito,
                fecha=fecha,
                estado=completado
            )
            nuevo_registro.save()
            
            return Response({
                "mensaje": "Registro creado",
                "registro": {
                    "id": str(nuevo_registro.id),
                    "habito": habito.nombre,
                    "fecha": str(fecha),
                    "estado": completado
                }
            }, status=status.HTTP_201_CREATED)


class HabitoViewSet(viewsets.ModelViewSet):
    serializer_class = HabitoSerializer
    permission_classes = [IsAuthenticated]
    #pagination_class = HabitoPagination

    def get_queryset(self):
        queryset = Habito.objects.all()
        usuario = self.request.query_params.get('usuario')
        categoria = self.request.query_params.get('categoria')
        nombre = self.request.query_params.get('nombre')
        descripcion = self.request.query_params.get('descripcion')
        dificultad = self.request.query_params.get('dificultad')
        fecha_inicio = self.request.query_params.get('fecha_inicio')
        tipo_frecuencia = self.request.query_params.get('tipo_frecuencia') 
        #dias = self.request.query_params.get('dias') 
        publico = self.request.query_params.get('publico') 
        activo = self.request.query_params.get('activo') 
        #noticaciones = self.request.query_params.get('notificaciones')
        
        if usuario:
            try:
                # Convertir string a ObjectId para MongoEngine
                usuario_obj = Usuario.objects.get(id=ObjectId(usuario))
                queryset = queryset.filter(usuario=usuario_obj)
            except (Usuario.DoesNotExist, Exception):
                # Si el usuario no existe o el ID es inválido, devolver queryset vacío
                return Habito.objects.none()
        
        if categoria:
            try:
                # Convertir string a ObjectId para MongoEngine
                categoria_obj = Categoria.objects.get(id=ObjectId(categoria))
                queryset = queryset.filter(categoria=categoria_obj)
            except (Categoria.DoesNotExist, Exception):
                pass
        if dificultad:
            queryset = queryset.filter(dificultad__icontains=dificultad)
        if publico is not None:
            queryset = queryset.filter(publico=(publico.lower() == 'true'))
        if activo is not None:
            queryset = queryset.filter(activo=(activo.lower() == 'true'))
        if tipo_frecuencia:
            queryset = queryset.filter(tipo_frecuencia__icontains=tipo_frecuencia)
        if nombre:
            queryset = queryset.filter(nombre__icontains=nombre)
        if descripcion:
            queryset = queryset.filter(descripcion__icontains=descripcion)
        ordering = self.request.query_params.get('ordering')  # Ejemplo: ?ordering=-fecha_inicio
        
        if ordering:
            allowed_fields = [
                'nombre',
                'dificultad',
                'fecha_inicio'
            ]
            field = ordering.lstrip('-')
            if field in allowed_fields:
                queryset = queryset.order_by(ordering)

        return queryset
    
    @action(detail=True, methods=['get'])
    def progreso_semanal(self, request, id=None):
        """Calcula el progreso del hábito en la semana actual (lunes a domingo)."""
        habito = self.get_object()
        hoy = date.today()

        # Calcular lunes y domingo de esta semana
        inicio_semana = hoy - timedelta(days=hoy.weekday())  # lunes
        fin_semana = inicio_semana + timedelta(days=6)        # domingo

        registros = RegistroHabito.objects(
            habito=habito,
            fecha__gte=inicio_semana,
            fecha__lte=fin_semana
        )
        # Calcular total según la frecuencia del hábito
        if(str.capitalize(habito.tipo_frecuencia) == "Diario"):
            total = 7

        elif(str.capitalize(habito.tipo_frecuencia) == "Semanal"):
            total = len(habito.dias)
        
        elif(str.capitalize(habito.tipo_frecuencia) == "Mensual"):
            # Para hábitos mensuales: contar cuántos días configurados caen en la semana actual
            if habito.dias and len(habito.dias) > 0:
                total = 0
                # Recorrer cada día de la semana
                current_day = inicio_semana
                while current_day <= fin_semana:
                    dia_del_mes = current_day.day
                    # Verificar si este día del mes está configurado en el hábito
                    if dia_del_mes in habito.dias:
                        total += 1
                    current_day += timedelta(days=1)
            else:
                total = 0  # No hay días configurados
        
        else:
            total = 0

        completados = registros.filter(estado=True).count()
        progreso = (completados / total * 100) if total > 0 else 0 #Por si total llega a ser 0
        
        return Response({
            "habito_id":str(habito.id),
            "habito": habito.nombre,
            "inicio_semana": inicio_semana,
            "fin_semana":fin_semana,
            "progreso_semanal": round(progreso, 2),
            "completados": completados,
            "total": total
        })
    
    @action(detail=True, methods=['get'])
    def progreso_mensual(self, request, id=None):
        """Calcula el progreso del hábito en el mes actual."""
        habito = self.get_object()
        hoy = date.today()

        # Calcular primer y último día del mes actual
        inicio_mes = hoy.replace(day=1)
        semanas_mes = calendar.monthcalendar(hoy.year, hoy.month)
        _, ultimo_dia = calendar.monthrange(hoy.year, hoy.month)
        fin_mes = hoy.replace(day=ultimo_dia)

        registros = RegistroHabito.objects(
            habito=habito,
            fecha__gte=inicio_mes,
            fecha__lte=fin_mes
        )

        # Calcular total según la frecuencia del hábito
        if(str.capitalize(habito.tipo_frecuencia) == "Diario"):
            total = ultimo_dia

        elif(str.capitalize(habito.tipo_frecuencia) == "Semanal"):
            total = len(habito.dias) * len(semanas_mes)
        
        elif(str.capitalize(habito.tipo_frecuencia) == "Mensual"):
            # Para hábitos mensuales: contar cuántos días configurados hay en el mes
            if habito.dias and len(habito.dias) > 0:
                # Filtrar días que sean válidos para el mes actual
                dias_validos = [dia for dia in habito.dias if isinstance(dia, int) and 1 <= dia <= ultimo_dia]
                total = len(dias_validos)
            else:
                total = 1  # Fallback si no hay días configurados
        
        else: 
            total = 0

        completados = registros.filter(estado=True).count()
        progreso = (completados / total * 100) if total > 0 else 0

        return Response({
            "habito": habito.nombre,
            "inicio_mes": inicio_mes,
            "fin_mes": fin_mes,
            "progreso_mensual": round(progreso, 2),
            "registros_totales": total,
            "completados": completados,
            "total": total
        })

"""
class UsuarioViewSet(viewsets.ViewSet):
    
    def list(self, request):
        usuarios = Usuario.objects.all()
        serializer = UsuarioSerializer(usuarios, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        usuario = Usuario.objects.get(id=pk)
        serializer = UsuarioSerializer(usuario)
        return Response(serializer.data)
    
    def create(self, request):
        serializer = UsuarioSerializer(data=request.data)
        if serializer.is_valid():
            usuario = Usuario(**serializer.validated_data)
            usuario.save()
            return Response(UsuarioSerializer(usuario).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


"""

class ToolViewSet(viewsets.ModelViewSet):
    '''
    Contains information about inputs/outputs of a single program
    that may be used in Universe workflows.
    '''
    lookup_field = 'id'
    serializer_class = ToolSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Tool.objects.all()