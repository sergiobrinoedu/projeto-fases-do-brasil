-- 05_phases.sql — fases históricas e tabelas filhas (parágrafos, destaques, imagens)
USE `fases_do_brasil`;

CREATE TABLE IF NOT EXISTS `phases` (
  `id`         VARCHAR(48) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `period_id`  VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `title`      VARCHAR(120) NOT NULL,
  `subtitle`   VARCHAR(120) NOT NULL,
  `start_year` SMALLINT     NOT NULL,
  `end_year`   SMALLINT     NULL,
  `art`        VARCHAR(32)  NULL COMMENT 'tema da ilustração gerada',
  `summary`    TEXT         NOT NULL,
  `sort_order` SMALLINT     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_phases_order` (`sort_order`),
  KEY `ix_phases_period` (`period_id`),
  CONSTRAINT `fk_phases_period` FOREIGN KEY (`period_id`) REFERENCES `periods` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `phase_paragraphs` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `phase_id`   VARCHAR(48) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `position`   SMALLINT NOT NULL,
  `content`    TEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_paragraph_pos` (`phase_id`,`position`),
  CONSTRAINT `fk_paragraph_phase` FOREIGN KEY (`phase_id`) REFERENCES `phases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `phase_highlights` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `phase_id`   VARCHAR(48) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `position`   SMALLINT NOT NULL,
  `text`       VARCHAR(160) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_highlight_pos` (`phase_id`,`position`),
  CONSTRAINT `fk_highlight_phase` FOREIGN KEY (`phase_id`) REFERENCES `phases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `phase_images` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `phase_id`   VARCHAR(48) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `position`   SMALLINT NOT NULL,
  `url`        VARCHAR(500) NOT NULL COMMENT 'ex.: /images/cabral-1.jpg',
  `caption`    VARCHAR(200) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_image_pos` (`phase_id`,`position`),
  CONSTRAINT `fk_image_phase` FOREIGN KEY (`phase_id`) REFERENCES `phases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
