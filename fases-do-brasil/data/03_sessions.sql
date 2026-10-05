-- 03_sessions.sql — sessões de login (token opaco guardado como hash SHA-256)
USE `fases_do_brasil`;

CREATE TABLE IF NOT EXISTS `sessions` (
  `id`         CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'SHA-256 do token do cookie',
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `user_agent` VARCHAR(255) NULL,
  `ip`         VARCHAR(45)  NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_sessions_user` (`user_id`),
  KEY `ix_sessions_expires` (`expires_at`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
