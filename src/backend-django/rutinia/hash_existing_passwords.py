"""
Script para hashear las contraseñas de usuarios existentes
Ejecutar una sola vez después de implementar JWT
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rutinia.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from core.models import Usuario

def hash_existing_passwords():
    """
    Hashea las contraseñas de todos los usuarios que tienen contraseñas en texto plano
    """
    usuarios = Usuario.objects.all()
    
    print(f"🔍 Encontrados {usuarios.count()} usuarios")
    
    actualizados = 0
    for usuario in usuarios:
        # Verificar si la contraseña ya está hasheada
        # Las contraseñas hasheadas empiezan con prefijos como 'pbkdf2_sha256$'
        if not usuario.clave.startswith('pbkdf2_sha256$'):
            print(f"📝 Hasheando contraseña para: {usuario.correo}")
            
            # Guardar la contraseña original temporalmente
            password_original = usuario.clave
            
            # Hashear la contraseña
            usuario.clave = make_password(password_original)
            usuario.save()
            
            actualizados += 1
        else:
            print(f"✅ Usuario {usuario.correo} ya tiene contraseña hasheada")
    
    print(f"\n✨ Proceso completado!")
    print(f"✅ {actualizados} contraseñas actualizadas")
    print(f"⏭️  {usuarios.count() - actualizados} usuarios ya tenían contraseñas hasheadas")

if __name__ == '__main__':
    print("=" * 60)
    print("🔐 SCRIPT PARA HASHEAR CONTRASEÑAS EXISTENTES")
    print("=" * 60)
    print("\n⚠️  ADVERTENCIA: Este script modificará las contraseñas en la BD")
    print("   Solo las contraseñas en texto plano serán hasheadas")
    print()
    
    respuesta = input("¿Continuar? (s/n): ")
    
    if respuesta.lower() == 's':
        hash_existing_passwords()
    else:
        print("❌ Operación cancelada")
