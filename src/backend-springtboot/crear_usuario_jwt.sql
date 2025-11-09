-- Script para crear un usuario de prueba con JWT
-- Contraseña: rutinia123 (ya cifrada con BCrypt)
-- Email: juan@rutinia.com

INSERT INTO Usuario (nombre, apellido, correo, clave, id_rol, tema, notificaciones)
VALUES (
    'Juan',
    'Ballesteros',
    'juan@rutinia.com',
    '$2a$10$YfD5L5kK3vJ5YwD9nW3Qy.xN8sZ7k1mP9vH3wQ4xT6yR5vW8sZ9kK',  -- rutinia123 encriptada
    1,
    'light',
    true
);

-- Verificar que el usuario fue creado
SELECT * FROM Usuario WHERE correo = 'juan@rutinia.com';
