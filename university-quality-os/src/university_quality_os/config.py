"""Centralized configuration loaded from .env file.

Usage:
    from university_quality_os.config import settings
    print(settings.iso_source)
"""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


# Project root = parent of this file's grandparent
# src/university_quality_os/config.py → project_root
PROJECT_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Application settings loaded from .env or environment."""

    # API keys
    anthropic_api_key: str = ""
    openai_api_key: str = ""

    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/quality_os"

    # Source paths (relative to project root, resolved to absolute)
    iso_source: str = "../de-an-thanh-lap-cong-ty/university/iso"
    congvan_source: str = "../de-an-thanh-lap-cong-ty/university/congvan"
    criteria_md_source: str = "../kiem-dinh-chat-luong/PHAN-TICH-TONG-THE.md"

    # Sampling
    sample_docs_per_dept: int = 10
    sample_seed: int = 42

    # Models
    claude_model_primary: str = "claude-sonnet-4-6"
    claude_model_fast: str = "claude-haiku-4-5-20251001"
    openai_model: str = "gpt-4o-mini"

    # Logging
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=str(PROJECT_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def iso_source_path(self) -> Path:
        return (PROJECT_ROOT / self.iso_source).resolve()

    @property
    def congvan_source_path(self) -> Path:
        return (PROJECT_ROOT / self.congvan_source).resolve()

    @property
    def criteria_md_path(self) -> Path:
        return (PROJECT_ROOT / self.criteria_md_source).resolve()

    @property
    def data_dir(self) -> Path:
        d = PROJECT_ROOT / "data"
        d.mkdir(exist_ok=True)
        return d

    @property
    def raw_iso_dir(self) -> Path:
        d = self.data_dir / "raw" / "iso"
        d.mkdir(parents=True, exist_ok=True)
        return d

    @property
    def extracted_dir(self) -> Path:
        d = self.data_dir / "extracted"
        d.mkdir(parents=True, exist_ok=True)
        return d


settings = Settings()


# Department name mapping (folder name → full Vietnamese name)
DEPT_NAME_MAP = {
    "KHAO THI": "Phòng Khảo thí và Đảm bảo chất lượng",
    "P.CTSV": "Phòng Công tác Sinh viên",
    "P.DAOTAO": "Phòng Đào tạo",
    "P.HC-TH": "Phòng Hành chính - Tổng hợp",
    "P.HTQT-TT": "Phòng Hợp tác Quốc tế và Truyền thông",
    "P.KH-CN": "Phòng Khoa học Công nghệ",
    "P.QLDA và QTTB": "Phòng Quản lý Dự án và Quản trị Trang thiết bị",
    "P.TCKT": "Phòng Tài chính Kế toán",
    "P.TCNS": "Phòng Tổ chức Nhân sự",
    "P.TTPC": "Phòng Thanh tra Pháp chế",
    "P.Tuyensinh": "Phòng Tuyển sinh",
}


if __name__ == "__main__":
    # Sanity check when run directly
    print(f"Project root:       {PROJECT_ROOT}")
    print(f"ISO source:         {settings.iso_source_path}")
    print(f"  exists?           {settings.iso_source_path.exists()}")
    print(f"Congvan source:     {settings.congvan_source_path}")
    print(f"  exists?           {settings.congvan_source_path.exists()}")
    print(f"Criteria MD:        {settings.criteria_md_path}")
    print(f"  exists?           {settings.criteria_md_path.exists()}")
    print(f"Data dir:           {settings.data_dir}")
    print(f"Anthropic API key:  {'SET' if settings.anthropic_api_key else 'MISSING'}")
    print(f"OpenAI API key:     {'SET' if settings.openai_api_key else 'MISSING'}")
