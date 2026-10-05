-- 02_users.sql — usuários (conta própria do site OU conta Google)
-- Compatível com innodb-page-size=4K (docker/docker-compose.yml): índices ≤ 768 bytes.
USE `fases_do_brasil`;

CREATE TABLE IF NOT EXISTS `users` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`           VARCHAR(100)  NOT NULL,
  `email`          VARCHAR(160)  NOT NULL,
  `password_hash`  VARCHAR(100)  NULL COMMENT 'bcrypt; NULL quando o cadastro foi feito só pelo Google',
  `google_sub`     VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL COMMENT 'ID estável da conta Google',
  `avatar_url`     VARCHAR(500)  NULL,
  `auth_provider`  ENUM('local','google') NOT NULL DEFAULT 'local',
  `email_verified` TINYINT(1)    NOT NULL DEFAULT 0,
  `role`           ENUM('student','editor') NOT NULL DEFAULT 'student',
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_at`  DATETIME      NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_google_sub` (`google_sub`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
