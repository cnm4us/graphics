-- Graphics project migrations
-- This file is intended to be idempotent: always use IF NOT EXISTS / IF EXISTS
-- so it can be safely re-run.
--
-- To apply locally from the EC2 instance, you can run:
--   mysql -u graphics -p -h 127.0.0.1 graphics < db/migrations.sql

-- =====================================================================
-- 001 - Core auth and spaces
-- =====================================================================

-- Users who can log in and own spaces.
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Spaces: containers for characters, scenes, styles, etc.
CREATE TABLE IF NOT EXISTS spaces (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_spaces_owner_user_id (owner_user_id),
  CONSTRAINT fk_spaces_owner_user_id
    FOREIGN KEY (owner_user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 002 - Characters, styles, scenes, images
-- =====================================================================

-- Characters live inside spaces and represent logical identities.
CREATE TABLE IF NOT EXISTS characters (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  space_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_characters_space_id (space_id),
  CONSTRAINT fk_characters_space_id
    FOREIGN KEY (space_id) REFERENCES spaces (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Character versions capture immutable snapshots of a character's descriptive fields.
CREATE TABLE IF NOT EXISTS character_versions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  character_id BIGINT UNSIGNED NOT NULL,
  version_number INT NOT NULL,
  label VARCHAR(255) NULL,
  identity_summary TEXT NULL,
  physical_description TEXT NULL,
  wardrobe_description TEXT NULL,
  personality_mannerisms TEXT NULL,
  extra_notes TEXT NULL,
  base_prompt TEXT NULL,
  negative_prompt TEXT NULL,
  base_seed BIGINT UNSIGNED NULL,
  cloned_from_version_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_character_versions_character_version (character_id, version_number),
  KEY idx_character_versions_character_id (character_id),
  CONSTRAINT fk_character_versions_character
    FOREIGN KEY (character_id) REFERENCES characters (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_character_versions_cloned_from
    FOREIGN KEY (cloned_from_version_id) REFERENCES character_versions (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Structured appearance data for character versions, stored as JSON.
ALTER TABLE character_versions
  ADD COLUMN IF NOT EXISTS appearance_json JSON NOT NULL DEFAULT ('{}')
  AFTER extra_notes;

-- Styles live inside spaces and serve as reusable render instructions.
CREATE TABLE IF NOT EXISTS styles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  space_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_styles_space_id (space_id),
  CONSTRAINT fk_styles_space_id
    FOREIGN KEY (space_id) REFERENCES spaces (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Style versions capture immutable snapshots of style/render instructions.
CREATE TABLE IF NOT EXISTS style_versions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  style_id BIGINT UNSIGNED NOT NULL,
  version_number INT NOT NULL,
  label VARCHAR(255) NULL,
  art_style TEXT NULL,
  color_palette TEXT NULL,
  lighting TEXT NULL,
  camera TEXT NULL,
  render_technique TEXT NULL,
  negative_prompt TEXT NULL,
  base_seed BIGINT UNSIGNED NULL,
  cloned_from_version_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_style_versions_style_version (style_id, version_number),
  KEY idx_style_versions_style_id (style_id),
  CONSTRAINT fk_style_versions_style
    FOREIGN KEY (style_id) REFERENCES styles (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_style_versions_cloned_from
    FOREIGN KEY (cloned_from_version_id) REFERENCES style_versions (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scenes represent locations/environments inside a space.
CREATE TABLE IF NOT EXISTS scenes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  space_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_scenes_space_id (space_id),
  CONSTRAINT fk_scenes_space_id
    FOREIGN KEY (space_id) REFERENCES spaces (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scene versions capture immutable snapshots of an environment.
CREATE TABLE IF NOT EXISTS scene_versions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  scene_id BIGINT UNSIGNED NOT NULL,
  version_number INT NOT NULL,
  label VARCHAR(255) NULL,
  environment_description TEXT NULL,
  layout_description TEXT NULL,
  time_of_day TEXT NULL,
  mood TEXT NULL,
  base_prompt TEXT NULL,
  negative_prompt TEXT NULL,
  base_seed BIGINT UNSIGNED NULL,
  cloned_from_version_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_scene_versions_scene_version (scene_id, version_number),
  KEY idx_scene_versions_scene_id (scene_id),
  CONSTRAINT fk_scene_versions_scene
    FOREIGN KEY (scene_id) REFERENCES scenes (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_scene_versions_cloned_from
    FOREIGN KEY (cloned_from_version_id) REFERENCES scene_versions (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Images/generations tie together specific versions + seeds + prompts.
CREATE TABLE IF NOT EXISTS images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  space_id BIGINT UNSIGNED NOT NULL,
  character_version_id BIGINT UNSIGNED NULL,
  style_version_id BIGINT UNSIGNED NULL,
  scene_version_id BIGINT UNSIGNED NULL,
  seed BIGINT UNSIGNED NOT NULL,
  model_name VARCHAR(255) NOT NULL,
  aspect_ratio VARCHAR(32) NULL,
  resolution VARCHAR(32) NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT NULL,
  s3_key VARCHAR(512) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_images_space_id (space_id),
  KEY idx_images_character_version_id (character_version_id),
  KEY idx_images_style_version_id (style_version_id),
  KEY idx_images_scene_version_id (scene_version_id),
  CONSTRAINT fk_images_space
    FOREIGN KEY (space_id) REFERENCES spaces (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_images_character_version
    FOREIGN KEY (character_version_id) REFERENCES character_versions (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_images_style_version
    FOREIGN KEY (style_version_id) REFERENCES style_versions (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_images_scene_version
    FOREIGN KEY (scene_version_id) REFERENCES scene_versions (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure images has a soft-delete marker for safe removal while keeping history.
ALTER TABLE images
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL
  AFTER created_at;

-- Usage / billing log for image generation and deletion.
CREATE TABLE IF NOT EXISTS image_usage_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  space_id BIGINT UNSIGNED NOT NULL,
  image_id BIGINT UNSIGNED NULL,
  action ENUM('CREATE','DELETE') NOT NULL,
  model_name VARCHAR(255) NOT NULL,
  seed BIGINT UNSIGNED NULL,
  s3_key VARCHAR(512) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_image_usage_user_id (user_id),
  KEY idx_image_usage_space_id (space_id),
  KEY idx_image_usage_image_id (image_id),
  CONSTRAINT fk_image_usage_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_image_usage_space
    FOREIGN KEY (space_id) REFERENCES spaces (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_image_usage_image
    FOREIGN KEY (image_id) REFERENCES images (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
