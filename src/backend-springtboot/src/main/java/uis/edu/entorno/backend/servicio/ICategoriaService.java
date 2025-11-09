package uis.edu.entorno.backend.servicio;

import java.util.List;

import uis.edu.entorno.backend.modelo.Categoria;

public interface ICategoriaService {

	//Listar categorias
	List<Categoria> getCategorias();
	
	//Nueva categoria
	
	Categoria nuevaCategoria(Categoria categoria);
	
	//Buscar por ID
	
	Categoria buscarCategoria (int id);
	
	//Borrar categoria
	
	void borrarCategoria(int id);

	
}
