CREATE SCHEMA `hotel_db` ;

CREATE TABLE `hotel_db`.`usuario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(45) NULL,
  `cpf` VARCHAR(45) NULL,
  `email` VARCHAR(45) NULL,
  `senha` VARCHAR(45) NULL,
  `telefone` VARCHAR(45) NULL,
  `tipo` VARCHAR(45) NULL,
  PRIMARY KEY (`id`));

  