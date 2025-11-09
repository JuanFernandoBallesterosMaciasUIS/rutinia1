package uis.edu.entorno.backend.modelo;

public class AuthResponseDto {
    private String token;
    private String tipo = "Bearer";
    private Integer idUsuario;
    private String nombre;
    private String correo;

    // Constructores
    public AuthResponseDto() {}

    public AuthResponseDto(String token, Integer idUsuario, String nombre, String correo) {
        this.token = token;
        this.idUsuario = idUsuario;
        this.nombre = nombre;
        this.correo = correo;
    }

    // Getters y Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }
}
