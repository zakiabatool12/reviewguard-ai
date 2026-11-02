import mysql.connector
from config import Config


def get_connection():
    options = dict(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        connection_timeout=15,
    )
    if Config.DB_SSL:
        options["ssl_disabled"] = False
        if Config.DB_SSL_CA:
            options["ssl_ca"] = Config.DB_SSL_CA
            options["ssl_verify_cert"] = True
    return mysql.connector.connect(**options)