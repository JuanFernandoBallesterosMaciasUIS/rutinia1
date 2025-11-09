package uis.edu.entorno.backend.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import uis.edu.entorno.backend.modelo.Usuario;
import uis.edu.entorno.backend.repositorio.IUsuarioRepositorio;

import java.util.List;

/**
 * Script para migrar contraseñas existentes a formato BCrypt
 * 
 * IMPORTANTE: Este script debe ejecutarse UNA SOLA VEZ después de implementar JWT
 * Una vez que todas las contraseñas estén migradas, puedes comentar o eliminar
 * la anotación @Component para evitar que se ejecute en cada inicio.
 * 
 * Para desactivar temporalmente sin eliminar el código, comenta @Component
 */
//@Component  // Descomenta esta línea SOLO cuando quieras ejecutar la migración
public class MigracionPasswordsBCrypt implements CommandLineRunner {

    @Autowired
    private IUsuarioRepositorio usuarioRepositorio;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== Iniciando migración de contraseñas a BCrypt ===");
        
        List<Usuario> usuarios = usuarioRepositorio.findAll();
        int migrados = 0;
        
        for (Usuario usuario : usuarios) {
            // Verificar si la contraseña ya está encriptada con BCrypt
            // Las contraseñas BCrypt comienzan con $2a$, $2b$ o $2y$
            if (usuario.getClave() != null && !usuario.getClave().startsWith("$2")) {
                String passwordOriginal = usuario.getClave();
                String passwordEncriptada = passwordEncoder.encode(passwordOriginal);
                
                usuario.setClave(passwordEncriptada);
                usuarioRepositorio.save(usuario);
                
                migrados++;
                System.out.println("✓ Contraseña migrada para usuario: " + usuario.getCorreo());
            } else {
                System.out.println("○ Usuario ya tiene contraseña BCrypt: " + usuario.getCorreo());
            }
        }
        
        System.out.println("=== Migración completada ===");
        System.out.println("Total de contraseñas migradas: " + migrados);
        System.out.println("Total de usuarios: " + usuarios.size());
        System.out.println("\nIMPORTANTE: Ahora puedes comentar la anotación @Component");
        System.out.println("en la clase MigracionPasswordsBCrypt para evitar que se ejecute nuevamente.");
    }
}
