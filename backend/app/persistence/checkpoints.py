from langgraph.checkpoint.postgres import PostgresSaver
from sqlalchemy.engine import make_url


def checkpoint_connection_string(database_url: str) -> str:
    rendered = make_url(database_url).render_as_string(hide_password=False)
    return rendered.replace("postgresql+psycopg://", "postgresql://", 1)


def setup_checkpoint_schema(database_url: str) -> None:
    with PostgresSaver.from_conn_string(checkpoint_connection_string(database_url)) as checkpointer:
        checkpointer.setup()
