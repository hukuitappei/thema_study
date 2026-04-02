from json import dumps
from pathlib import Path

from app.main import app


def main() -> None:
    target = (
        Path(__file__).resolve().parents[2] / "frontend" / "openapi" / "schema.json"
    )
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(dumps(app.openapi(), indent=2), encoding="utf-8")
    print(f"OpenAPI schema exported to {target}")


if __name__ == "__main__":
    main()

