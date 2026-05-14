CREATE SCHEMA IF NOT EXISTS `hotel_db`;
USE `hotel_db`;

CREATE TABLE `usuario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(45) NULL,
  `cpf` VARCHAR(45) NULL,
  `email` VARCHAR(45) NULL,
  `senha` VARCHAR(255) NULL,
  `telefone` VARCHAR(45) NULL,
  `tipo` ENUM("RECEPCIONISTA", "GERENTE") NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE
);

CREATE TABLE `quartos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `room_number` VARCHAR(10) NULL,
  `tipo` VARCHAR(45) NULL,
  `preco` DECIMAL(10,2) NULL,
  `capacidade` INT NULL,
  `descricao` VARCHAR(45) NULL,
  `status` ENUM("DISPONIVEL", "OCUPADO", "MANUTENCAO", "LIMPEZA") DEFAULT "DISPONIVEL",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `room_number_UNIQUE` (`room_number` ASC) VISIBLE
);

CREATE TABLE `hospedes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `cpf` VARCHAR(14) NOT NULL,
  `email` VARCHAR(100) NULL,
  `telefone` VARCHAR(20) NULL,
  `endereco` VARCHAR(255) NULL,
  `data_cadastro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `cpf_UNIQUE` (`cpf` ASC),
  UNIQUE INDEX `email_hosp_UNIQUE` (`email` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NULL,
  `acao` VARCHAR(255) NULL,
  `detalhes` TEXT NULL,
  `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_usuario_logs_idx` (`usuario_id` ASC) VISIBLE,
  CONSTRAINT `fk_usuario_logs`
    FOREIGN KEY (`usuario_id`)
    REFERENCES `usuario` (`id`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION
);

CREATE TABLE `reservas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `quarto_id` INT NOT NULL,
  `hospede_id` INT NOT NULL,
  `funcionario_id` INT NULL,
  `data_checkin` DATETIME NOT NULL,
  `checkout` DATETIME NOT NULL, 
  `valor_total` DECIMAL(10, 2) DEFAULT 0.00, 
  `status_reserva` ENUM('CONFIRMADA', 'CHECKIN', 'CHECKOUT', 'CANCELADA') DEFAULT 'CONFIRMADA',
  `status_pagamento` ENUM('PENDENTE', 'PAGO', 'PARCIAL') DEFAULT 'PENDENTE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_reserva_quarto_idx` (`quarto_id` ASC),
  INDEX `fk_reserva_hospede_idx` (`hospede_id` ASC),
  INDEX `fk_reserva_func_idx` (`funcionario_id` ASC),
  CONSTRAINT `fk_reserva_quarto`
    FOREIGN KEY (`quarto_id`)
    REFERENCES `quartos` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_reserva_hospede`
    FOREIGN KEY (`hospede_id`)
    REFERENCES `hospedes` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_reserva_func`
    FOREIGN KEY (`funcionario_id`)
    REFERENCES `usuario` (`id`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

select * from usuario;
select * from quartos;
select * from hospedes;


