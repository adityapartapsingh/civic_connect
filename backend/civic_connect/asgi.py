"""
ASGI config for Civic Connect project.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "civic_connect.settings")

application = get_asgi_application()
