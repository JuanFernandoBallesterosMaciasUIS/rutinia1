package uis.edu.entorno.backend.servicio;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import uis.edu.entorno.backend.modelo.Categoria;
import uis.edu.entorno.backend.repositorio.ICategoriaRepositorio;


@Service
@Transactional
public class CategoriaService implements ICategoriaService {

	@Autowired
	ICategoriaRepositorio categoriaRepositorio;
	
	@Override
	public List<Categoria> getCategorias(){
		//Lista de categorias
		return categoriaRepositorio.findAll();
	}
	
	@Override
	public Categoria buscarCategoria(int id) {
		//buscar una categoria
		Categoria categoria=null;
		
		categoria=categoriaRepositorio.findById(id).orElse(null);
		
		if (categoria==null) {
			return null;
		}
		return categoria;
		
	}
	
	@Override
	public Categoria nuevaCategoria(Categoria categoria) {
		//nueva categoria
		return categoriaRepositorio.save(categoria);
	}

	@Override
	public void borrarCategoria(int id) {
		//borrar categoria
		categoriaRepositorio.deleteById(id);
	}

	
}
