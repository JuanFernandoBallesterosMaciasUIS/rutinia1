package uis.edu.entorno.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import uis.edu.entorno.backend.modelo.Usuario;
import uis.edu.entorno.backend.repositorio.IUsuarioRepositorio;

import java.util.Collection;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private IUsuarioRepositorio usuarioRepositorio;

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepositorio.findByCorreo(correo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + correo));

        return new User(
            usuario.getCorreo(), 
            usuario.getClave(), 
            obtenerAutoridades(usuario)
        );
    }

    private Collection<? extends GrantedAuthority> obtenerAutoridades(Usuario usuario) {
        if (usuario.getRol() != null && usuario.getRol().getNombre() != null) {
            return Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + usuario.getRol().getNombre().toUpperCase())
            );
        }
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    public Usuario cargarUsuarioPorCorreo(String correo) {
        return usuarioRepositorio.findByCorreo(correo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + correo));
    }
}
