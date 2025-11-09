-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.43 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for rutinia
CREATE DATABASE IF NOT EXISTS `rutinia` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `rutinia`;

-- Dumping structure for table rutinia.categoria
CREATE TABLE IF NOT EXISTS `categoria` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table rutinia.categoria: ~2 rows (approximately)
DELETE FROM `categoria`;
INSERT INTO `categoria` (`id_categoria`, `nombre`) VALUES
	(1, 'estudio'),
	(2, 'Ejercicioo'),
	(4, 'Salud'),
	(5, 'Deporte');

-- Dumping structure for table rutinia.detalle_pedido
CREATE TABLE IF NOT EXISTS `detalle_pedido` (
  `Id_detalle_pedido` int NOT NULL AUTO_INCREMENT,
  `cantidad` int NOT NULL,
  `precioUnitaro` float NOT NULL,
  `id_pedido` int NOT NULL,
  `id_producto` int NOT NULL,
  PRIMARY KEY (`Id_detalle_pedido`),
  KEY `FK7n9hdifr08joboojejveby1vr` (`id_pedido`),
  KEY `FKjfm9pk0w2eag8tx8lu6pbego6` (`id_producto`),
  CONSTRAINT `FK7n9hdifr08joboojejveby1vr` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`Id_pedido`),
  CONSTRAINT `FKjfm9pk0w2eag8tx8lu6pbego6` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`Id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table rutinia.detalle_pedido: ~0 rows (approximately)
DELETE FROM `detalle_pedido`;

-- Dumping structure for table rutinia.frecuencia_habito
CREATE TABLE IF NOT EXISTS `frecuencia_habito` (
  `id_frecuencia` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(20) DEFAULT NULL,
  `veces` int DEFAULT NULL,
  PRIMARY KEY (`id_frecuencia`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table rutinia.frecuencia_habito: ~0 rows (approximately)
DELETE FROM `frecuencia_habito`;
INSERT INTO `frecuencia_habito` (`id_frecuencia`, `tipo`, `veces`) VALUES
	(1, 'diaria', 5);

-- Dumping structure for table rutinia.habito
CREATE TABLE IF NOT EXISTS `habito` (
  `habito_id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `frecuencia_id` int DEFAULT NULL,
  `categoria_id` int DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `descripcion` varchar(100) DEFAULT NULL,
  `dificultad` varchar(50) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `recompensa` varchar(100) DEFAULT NULL,
  `publico` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`habito_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `frecuencia_id` (`frecuencia_id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `habito_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `habito_ibfk_2` FOREIGN KEY (`frecuencia_id`) REFERENCES `frecuencia_habito` (`id_frecuencia`),
  CONSTRAINT `habito_ibfk_3` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table rutinia.habito: ~0 rows (approximately)
DELETE FROM `habito`;
INSERT INTO `habito` (`habito_id`, `usuario_id`, `frecuencia_id`, `categoria_id`, `nombre`, `descripcion`, `dificultad`, `fecha_inicio`, `fecha_fin`, `recompensa`, `publico`) VALUES
	(1, 1, 1, 1, 'Estudiar entornos', 'Repasar spring boot', 'Alta', '2025-09-22', NULL, NULL, 1),
	(3, 10, 1, 4, 'Tomar agua', 'Tomar agua todos los días ', 'Fácil', '2025-10-19', '2025-10-24', '', 0),
	(4, 10, 1, 5, 'Trotar', '', 'Medio', '2025-10-24', '2025-10-31', '', 0);

-- Dumping structure for table rutinia.pedido
CREATE TABLE IF NOT EXISTS `pedido` (
  `Id_pedido` int NOT NULL AUTO_INCREMENT,
  `Direccion` varchar(255) DEFAULT NULL,
  `Estado` varchar(255) DEFAULT NULL,
  `Fecha` date DEFAULT NULL,
  `Tipo_pago` varchar(255) DEFAULT NULL,
  `Total` float NOT NULL,
  `Id_usuario` int DEFAULT NULL,
  PRIMARY KEY (`Id_pedido`),
  KEY `FKex2tq59jjq6dcggqqhkooxc1w` (`Id_usuario`),
  CONSTRAINT `FKex2tq59jjq6dcggqqhkooxc1w` FOREIGN KEY (`Id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table rutinia.pedido: ~0 rows (approximately)
DELETE FROM `pedido`;

-- Dumping structure for table rutinia.producto
CREATE TABLE IF NOT EXISTS `producto` (
  `Id_producto` int NOT NULL AUTO_INCREMENT,
  `Descripcion` varchar(255) DEFAULT NULL,
  `Imagen` varchar(255) DEFAULT NULL,
  `Nombre` varchar(255) DEFAULT NULL,
  `Precio` float NOT NULL,
  `Stock` int NOT NULL,
  `Id_categoria` int DEFAULT NULL,
  `Id_usuario` int DEFAULT NULL,
  PRIMARY KEY (`Id_producto`),
  KEY `FKp0vboc8ilu7iuybgklh5vgde` (`Id_categoria`),
  KEY `FKlpua58bfb78cw4l04xyu7l6rh` (`Id_usuario`),
  CONSTRAINT `FKlpua58bfb78cw4l04xyu7l6rh` FOREIGN KEY (`Id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `FKp0vboc8ilu7iuybgklh5vgde` FOREIGN KEY (`Id_categoria`) REFERENCES `categoria` (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table rutinia.producto: ~0 rows (approximately)
DELETE FROM `producto`;

-- Dumping structure for table rutinia.recordatorio
CREATE TABLE IF NOT EXISTS `recordatorio` (
  `id_recordatorio` int NOT NULL AUTO_INCREMENT,
  `id_habito` int DEFAULT NULL,
  `hora` time DEFAULT NULL,
  `tipo_repeticion` varchar(20) DEFAULT NULL,
  `intervalo` int DEFAULT NULL,
  `dias_semana` varchar(20) DEFAULT NULL,
  `veces` int DEFAULT NULL,
  PRIMARY KEY (`id_recordatorio`),
  KEY `id_habito` (`id_habito`),
  CONSTRAINT `recordatorio_ibfk_1` FOREIGN KEY (`id_habito`) REFERENCES `habito` (`habito_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table rutinia.recordatorio: ~0 rows (approximately)
DELETE FROM `recordatorio`;

-- Dumping structure for table rutinia.rol
CREATE TABLE IF NOT EXISTS `rol` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  `descripcion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table rutinia.rol: ~2 rows (approximately)
DELETE FROM `rol`;
INSERT INTO `rol` (`id_rol`, `nombre`, `descripcion`) VALUES
	(1, 'usuario', 'usuario estandar'),
	(2, 'administrador', 'administrador de la pagina'),
	(3, 'supervisor', 'supervisa a otros usuarios');

-- Dumping structure for table rutinia.usuario
CREATE TABLE IF NOT EXISTS `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `id_rol` int DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `apellido` varchar(50) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `clave` varchar(100) DEFAULT NULL,
  `tema` varchar(20) DEFAULT NULL,
  `notificaciones` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  KEY `id_rol` (`id_rol`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table rutinia.usuario: ~2 rows (approximately)
DELETE FROM `usuario`;
INSERT INTO `usuario` (`id_usuario`, `id_rol`, `nombre`, `apellido`, `correo`, `clave`, `tema`, `notificaciones`) VALUES
	(1, 1, 'Helbert Alexeiv', 'Correa Uribe', 'helbert@gmail.com', 'alex20050419', 'oscuro', 1),
	(3, 2, 'Julian Javier', 'Lizcano villarreal', 'll@gmail.com', '20050419', 'Oscuro', 0),
	(4, 1, 'Juan', 'Ballesteros', 'juan@rutinia.com', '$2a$10$YfD5L5kK3vJ5YwD9nW3Qy.xN8sZ7k1mP9vH3wQ4xT6yR5vW8sZ9kK', 'claro', 1),
	(5, 1, 'Alexeiv101', 'Correa', 'alexeiv101@gmail.com', '$2a$10$FFvugXzkzrkR4Bguafv5nOWW2D/BWx1OPiP/bNSNNhMzijAYUSggK', 'light', 1),
	(7, 1, 'borrar', 'borrar', 'borrar@example.com', '$2a$10$aicoNeNinA9NctqF6ALY7.Ant96c9Ht3qTQcrMRBD.Db3ySEQfZpy', 'claro', 1),
	(9, 1, 'Jaimito', 'Perez', 'jaimito@gmail.com', '$2a$10$9sU/dKmgOh.YP4knkSQEseR4TbNpVGJ3jpLfv/ajHWl.9necpUuea', 'claro', 1),
	(10, 2, 'admin', 'admin', 'admin@admin.com', '$2a$10$0N7D6urD91mwM3QpOc1OBeXxR67LYEynmQkuPlYOoarTYestfzeV6', 'oscuro', 1);

-- Dumping structure for table rutinia.usuario_habito
CREATE TABLE IF NOT EXISTS `usuario_habito` (
  `id_uh` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `id_habito` int DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `veces_completado` int DEFAULT NULL,
  PRIMARY KEY (`id_uh`),
  KEY `usuario_id` (`usuario_id`),
  KEY `id_habito` (`id_habito`),
  CONSTRAINT `usuario_habito_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `usuario_habito_ibfk_2` FOREIGN KEY (`id_habito`) REFERENCES `habito` (`habito_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table rutinia.usuario_habito: ~0 rows (approximately)
DELETE FROM `usuario_habito`;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
