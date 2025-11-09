package uis.edu.entorno.backend.controlador;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;


import uis.edu.entorno.backend.modelo.Categoria;
import uis.edu.entorno.backend.servicio.CategoriaService;


@RestController
public class CategoriaControlador {

	@Autowired
	CategoriaService categoriaService;
	
	//Listar categorias
	@GetMapping("/api/categorias/list")
	public List<Categoria> cargarcategorias(){
		return categoriaService.getCategorias();
	}
	
	//Buscar por ID
	
	@GetMapping("/api/categorias/{id}")
	public Categoria buscarporId(@PathVariable int id) {
		
		return categoriaService.buscarCategoria(id);
	}
	
	//nueva categoria
	@PostMapping("/api/categorias/")
	public ResponseEntity<Categoria> nuevaCateg(@RequestBody Categoria categoria) {
		
		Categoria cat=categoriaService.nuevaCategoria(categoria);
		
		return new ResponseEntity<> (cat, HttpStatus.OK);
	}
	
	//editar categoria
	@PutMapping("/api/categorias/")
	//Es el tipo de dato que el método devolverá //con el formato JSON  de entrada se crea el objeto
	public ResponseEntity<Categoria> editar(@RequestBody Categoria categoria){
		Categoria obj =categoriaService.buscarCategoria(categoria.getIdCategoria());
		
		if (obj!=null) {
			//get obtiene los valores del JSón ingresado
			//set reestablece, cambia el valor actual
		
			obj.setNombre(categoria.getNombre());


			
			categoriaService.nuevaCategoria(obj);
		}else {
			return new ResponseEntity<>(obj, HttpStatus.INTERNAL_SERVER_ERROR);
		}
		return new ResponseEntity<> (obj, HttpStatus.OK);
		
	}
	
	//eliminar categoria
	@DeleteMapping("/api/categorias/{id}")
	public ResponseEntity<?> eliminarCategoria(@PathVariable int id) {
		Categoria obj = categoriaService.buscarCategoria(id);
		
		if (obj != null) {
			try {
				categoriaService.borrarCategoria(id);
				return new ResponseEntity<>(HttpStatus.OK);
			} catch (Exception e) {
				// Si hay error (por ejemplo, categoría en uso), retornar mensaje
				return new ResponseEntity<>(
					"No se puede eliminar la categoría. Puede estar asociada a hábitos existentes.", 
					HttpStatus.CONFLICT
				);
			}
		} else {
			return new ResponseEntity<>("Categoría no encontrada", HttpStatus.NOT_FOUND);
		}
	}
}
