package uis.edu.entorno.backend.repositorio;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import uis.edu.entorno.backend.modelo.Usuario;

import java.util.Optional;

//puente entre  objetos Java y la base de datos, permitiéndote realizar operaciones de CRUD
//sin necesidad de definir metodos

public interface IUsuarioRepositorio extends JpaRepository<Usuario, Integer> {

    @Query("select count(*) from Usuario u where u.correo = :nombreUsuario and u.clave = :password")
    Integer findByNombreUsuarioAndPassword(@Param("nombreUsuario") String nombreUsuario, @Param("password") String password);

    @Query("select u from Usuario u where u.correo = :nombreUsuario and u.clave = :password")
    Usuario findByNameAndPassword(@Param("nombreUsuario") String nombreUsuario, @Param("password") String password);

    // Método para buscar usuario por correo (necesario para JWT)
    Optional<Usuario> findByCorreo(String correo);

}
