import logging
import sys
from pythonjsonlogger import jsonlogger

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(jsonlogger.JsonFormatter(
    "%(asctime)s %(name)s %(levelname)s %(message)s %(pathname)s %(lineno)d"
))

logging.basicConfig(level=logging.INFO, handlers=[handler], force=True)
logger = logging.getLogger("spacenet.telemetry")
