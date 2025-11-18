"""
Configuration management using TOML files and cloud secrets managers.

Avoids .env file exposure by using TOML configuration files and cloud secrets managers.
"""

import os
from pathlib import Path
from typing import Optional

import toml
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppConfig(BaseSettings):
    """Application configuration."""

    name: str = "Labuan FSA E-Submission API"
    version: str = "1.0.0"
    debug: bool = False
    environment: str = "development"

    model_config = SettingsConfigDict(env_prefix="APP_", case_sensitive=False)


class ServerConfig(BaseSettings):
    """Server configuration."""

    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = False
    workers: int = 1

    model_config = SettingsConfigDict(env_prefix="SERVER_", case_sensitive=False)


class DatabaseConfig(BaseSettings):
    """Database configuration."""

    url: str = Field(
        default="postgresql+asyncpg://user:password@localhost:5432/labuan_fsa",
        description="Database URL",
    )
    echo: bool = False
    pool_size: int = 20
    max_overflow: int = 10
    pool_pre_ping: bool = True

    model_config = SettingsConfigDict(
        env_prefix="DB_", 
        case_sensitive=False,
        extra="ignore",
    )
    
    def __init__(self, **kwargs):
        """Override to check DATABASE_URL if DB_URL not set."""
        import os
        # Check DATABASE_URL first (common convention), then DB_URL
        if "url" not in kwargs:
            database_url = os.getenv("DATABASE_URL") or os.getenv("DB_URL")
            if database_url:
                # Ensure asyncpg driver if it's a PostgreSQL URL
                if database_url.startswith("postgresql://") and "+asyncpg" not in database_url:
                    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")
                kwargs["url"] = database_url
        super().__init__(**kwargs)


class SecurityConfig(BaseSettings):
    """Security configuration."""

    secret_key: str = Field(
        default="change-me-in-production-use-secrets-manager",
        description="Secret key for JWT tokens",
    )
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    model_config = SettingsConfigDict(env_prefix="SECURITY_", case_sensitive=False)


class StorageConfig(BaseSettings):
    """File storage configuration."""

    provider: str = Field(
        default="local",
        description="Storage provider: local, s3, azure, gcp",
    )
    local_path: str = "./uploads"
    s3_bucket: Optional[str] = None
    s3_region: Optional[str] = None
    azure_account_name: Optional[str] = None
    azure_container: Optional[str] = None
    gcp_bucket: Optional[str] = None
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_extensions: list[str] = Field(
        default_factory=lambda: [
            ".pdf",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
            ".jpg",
            ".jpeg",
            ".png",
        ]
    )

    model_config = SettingsConfigDict(env_prefix="STORAGE_", case_sensitive=False)


class SecretsManagerConfig(BaseSettings):
    """Secrets manager configuration."""

    provider: str = Field(
        default="local",
        description="Secrets provider: local, aws, azure, gcp",
    )
    aws_region: Optional[str] = None
    azure_vault_url: Optional[str] = None
    gcp_project_id: Optional[str] = None

    model_config = SettingsConfigDict(env_prefix="SECRETS_", case_sensitive=False)


class EmailConfig(BaseSettings):
    """Email service configuration."""

    provider: str = Field(
        default="local",
        description="Email provider: local, sendgrid, ses",
    )
    sendgrid_api_key: Optional[str] = None
    aws_ses_region: Optional[str] = None
    from_email: str = "noreply@labuanfsa.gov.my"
    from_name: str = "Labuan FSA"

    model_config = SettingsConfigDict(env_prefix="EMAIL_", case_sensitive=False)


class Settings(BaseSettings):
    """Main application settings."""

    app: AppConfig = Field(default_factory=AppConfig)
    server: ServerConfig = Field(default_factory=ServerConfig)
    database: DatabaseConfig = Field(default_factory=DatabaseConfig)
    security: SecurityConfig = Field(default_factory=SecurityConfig)
    storage: StorageConfig = Field(default_factory=StorageConfig)
    secrets_manager: SecretsManagerConfig = Field(default_factory=SecretsManagerConfig)
    email: EmailConfig = Field(default_factory=EmailConfig)

    model_config = SettingsConfigDict(
        env_file=".env",  # Fallback for environment variables
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @classmethod
    def load_from_toml(cls, config_path: Optional[Path] = None) -> "Settings":
        """
        Load settings from TOML file.

        Priority:
        1. Environment variables (highest priority in Vercel/serverless)
        2. config.local.toml (local development, gitignored)
        3. config.toml (shared configuration)
        4. Default values

        Args:
            config_path: Optional path to config file. If not provided, searches for config files.

        Returns:
            Settings instance with loaded configuration.
        """
        # In Vercel/serverless, prioritize environment variables
        import os
        if os.getenv("DATABASE_URL") or os.getenv("DB_URL"):
            print("🌐 Using environment variables (Vercel/serverless mode)")
            # Create settings from environment variables only
            settings = cls()
            # Override database URL from environment if set
            if os.getenv("DATABASE_URL") or os.getenv("DB_URL"):
                db_url = os.getenv("DATABASE_URL") or os.getenv("DB_URL")
                # Ensure asyncpg driver
                if db_url.startswith("postgresql://") and "+asyncpg" not in db_url:
                    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
                settings.database = DatabaseConfig(url=db_url)
                print(f"✅ Database URL loaded from environment: {db_url[:30]}...")
            return settings
        
        # Determine config file path
        if config_path is None:
            # Try multiple possible base directories
            possible_bases = [
                Path(__file__).parent.parent.parent.parent,  # backend/
                Path(__file__).parent.parent.parent,  # src/
                Path.cwd(),  # Current working directory
            ]
            
            local_config = None
            shared_config = None
            
            for base_dir in possible_bases:
                test_local = base_dir / "config.local.toml"
                test_shared = base_dir / "config.toml"
                if test_local.exists() and local_config is None:
                    local_config = test_local
                if test_shared.exists() and shared_config is None:
                    shared_config = test_shared
                if local_config and shared_config:
                    break

            # Prefer local config over shared config
            if local_config and local_config.exists():
                config_path = local_config
                print(f"📁 Loading config from: {config_path}")
            elif shared_config and shared_config.exists():
                config_path = shared_config
                print(f"📁 Loading config from: {config_path}")
            else:
                # No config file found, use defaults + environment variables
                print("⚠️  No config file found, using defaults + environment variables")
                return cls()

        # Load TOML file
        if not config_path.exists():
            raise FileNotFoundError(f"Config file not found: {config_path}")

        with open(config_path, "r") as f:
            config_data = toml.load(f)

        # Create settings from TOML data
        settings = cls()

        # Update settings from TOML
        if "app" in config_data:
            settings.app = AppConfig(**config_data["app"])
        if "server" in config_data:
            settings.server = ServerConfig(**config_data["server"])
        if "database" in config_data:
            settings.database = DatabaseConfig(**config_data["database"])
        if "security" in config_data:
            # For security config, check secrets manager first
            security_data = config_data["security"].copy()
            secret_key = security_data.get("secret_key")
            if secret_key and secret_key.startswith("secret://"):
                # Load from secrets manager
                secret_name = secret_key.replace("secret://", "")
                settings.secrets_manager = SecretsManagerConfig(**config_data.get("secrets_manager", {}))
                # In production, load from secrets manager here
                # For now, use environment variable or fallback
                secret_key = os.getenv("SECURITY_SECRET_KEY", secret_key)
                security_data["secret_key"] = secret_key
            settings.security = SecurityConfig(**security_data)
        if "storage" in config_data:
            settings.storage = StorageConfig(**config_data["storage"])
        if "secrets_manager" in config_data:
            settings.secrets_manager = SecretsManagerConfig(**config_data["secrets_manager"])
        if "email" in config_data:
            settings.email = EmailConfig(**config_data["email"])

        # Override with environment variables (highest priority)
        return cls(
            app=settings.app,
            server=settings.server,
            database=settings.database,
            security=settings.security,
            storage=settings.storage,
            secrets_manager=settings.secrets_manager,
            email=settings.email,
        )


# Global settings instance
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get global settings instance."""
    global _settings
    if _settings is None:
        import os
        try:
            _settings = Settings.load_from_toml()
        except Exception as e:
            # If TOML loading fails (e.g., in Vercel), use environment variables directly
            print(f"⚠️  Failed to load TOML config: {e}, using environment variables")
            _settings = Settings()
        
        # CRITICAL: Always check environment variables and override if set
        # This ensures Vercel environment variables always work
        db_url = os.getenv("DATABASE_URL") or os.getenv("DB_URL")
        if db_url:
            # Ensure asyncpg driver
            if db_url.startswith("postgresql://") and "+asyncpg" not in db_url:
                db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
            _settings.database.url = db_url
            print(f"✅ Database URL set from environment: {db_url[:50]}...")
        
        # Check other critical environment variables
        if os.getenv("SECRET_KEY"):
            _settings.security.secret_key = os.getenv("SECRET_KEY")
        
        if os.getenv("APP_ENVIRONMENT"):
            _settings.app.environment = os.getenv("APP_ENVIRONMENT")
        
        print(f"🔧 Final settings - Environment: {_settings.app.environment}, DB URL: {_settings.database.url[:50] if len(_settings.database.url) > 50 else _settings.database.url}...")
    
    return _settings


def reload_settings() -> Settings:
    """Reload settings from config file."""
    global _settings
    _settings = Settings.load_from_toml()
    return _settings

