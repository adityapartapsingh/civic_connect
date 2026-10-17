from django.apps import AppConfig


class ReportsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "reports"
    verbose_name = "Civic Reports"

    def ready(self):
        # Auto-initialize MongoDB indexes on startup if connected
        try:
            from civic_connect.mongo import init_indexes
            init_indexes()
        except Exception:
            pass
