package uis.edu.entorno.backend.controlador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import uis.edu.entorno.backend.modelo.AuthResponseDto;
import uis.edu.entorno.backend.modelo.LoginDto;
import uis.edu.entorno.backend.modelo.Usuario;
import uis.edu.entorno.backend.repositorio.IUsuarioRepositorio;
import uis.edu.entorno.backend.security.CustomUserDetailsService;
import uis.edu.entorno.backend.security.JwtTokenProvider;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthControlador {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private IUsuarioRepositorio usuarioRepositorio;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginDto loginDto) {
        try {
            // Autenticar al usuario
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginDto.getNombreUsuario(), // En este caso es el correo
                    loginDto.getPassword()
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generar token JWT
            String token = tokenProvider.generarToken(authentication);

            // Obtener información del usuario
            Usuario usuario = customUserDetailsService.cargarUsuarioPorCorreo(loginDto.getNombreUsuario());

            // Crear respuesta con token y datos del usuario
            AuthResponseDto authResponse = new AuthResponseDto(
                token,
                usuario.getIdUsuario(),
                usuario.getNombre() + " " + usuario.getApellido(),
                usuario.getCorreo()
            );

            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("mensaje", "Credenciales inválidas");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registerUser(@RequestBody Usuario usuario) {
        try {
            // Verificar si el correo ya existe
            if (usuarioRepositorio.findByCorreo(usuario.getCorreo()).isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("mensaje", "El correo ya está registrado");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Encriptar la contraseña
            usuario.setClave(passwordEncoder.encode(usuario.getClave()));

            // Guardar el usuario
            Usuario nuevoUsuario = usuarioRepositorio.save(usuario);

            // Generar token automáticamente después del registro
            String token = tokenProvider.generarTokenDesdeUsername(nuevoUsuario.getCorreo());

            // Crear respuesta
            AuthResponseDto authResponse = new AuthResponseDto(
                token,
                nuevoUsuario.getIdUsuario(),
                nuevoUsuario.getNombre() + " " + nuevoUsuario.getApellido(),
                nuevoUsuario.getCorreo()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("mensaje", "Error al registrar usuario");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/validar")
    public ResponseEntity<?> validarToken(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            if (tokenProvider.validarToken(token)) {
                String username = tokenProvider.obtenerUsernameDeJwt(token);
                Usuario usuario = customUserDetailsService.cargarUsuarioPorCorreo(username);
                
                Map<String, Object> response = new HashMap<>();
                response.put("valido", true);
                response.put("usuario", usuario.getNombre() + " " + usuario.getApellido());
                response.put("correo", usuario.getCorreo());
                
                return ResponseEntity.ok(response);
            }
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("valido", false);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("mensaje", "Token inválido");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
}
