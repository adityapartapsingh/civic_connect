"""
WSGI config for Civic Connect project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "civic_connect.settings")

application = get_wsgi_application()
