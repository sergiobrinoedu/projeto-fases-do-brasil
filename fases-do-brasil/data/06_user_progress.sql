-- 06_user_progress.sql — progresso de leitura por usuário (sincroniza com o navegador)
USE `fases_do_brasil`;

CREATE TABLE IF NOT EXISTS `user_phase_read` (
  `user_id`  BIGINT UNSIGNED NOT NULL,
  `phase_id` VARCHAR(48) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `read_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`phase_id`),
  CONSTRAINT `fk_upr_user`  FOREIGN KEY (`user_id`)  REFERENCES `users` (`id`)  ON DELETE CASCADE,
  CONSTRAINT `fk_upr_phase` FOREIGN KEY (`phase_id`) REFERENCES `phases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_journey` (
  `user_id`       BIGINT UNSIGNED NOT NULL,
  `current_index` SMALLINT NULL COMMENT 'índice da fase atual; NULL = jornada concluída',
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_uj_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
