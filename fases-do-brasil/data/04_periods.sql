-- 04_periods.sql — grandes períodos (Colônia, Império, República)
USE `fases_do_brasil`;

CREATE TABLE IF NOT EXISTS `periods` (
  `id`          VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `name`        VARCHAR(80)  NOT NULL,
  `start_year`  SMALLINT     NOT NULL,
  `end_year`    SMALLINT     NULL COMMENT 'NULL = em andamento',
  `description` TEXT         NOT NULL,
  `sort_order`  SMALLINT     NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
