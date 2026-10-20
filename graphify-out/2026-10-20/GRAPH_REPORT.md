# Graph Report - civic connect  (2026-10-18)

## Corpus Check
- 112 files · ~39,729 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 764 nodes · 1806 edges · 38 communities (23 shown, 15 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 76 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `911dfb1a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- users/views.py
- reports/views.py
- tokens.py
- ReportManager
- reports/models.py
- fraud/tests.py
- GamificationManager
- wards/views.py
- GamificationManager
- django_apps
- compilerOptions
- package.json
- notifications/views.py
- dependencies
- devDependencies
- manifest.json
- compilerOptions
- vite.config.ts
- scripts
- route_category_to_department
- vercel.json
- get_collection
- Key Architecture & Features
- mongo.py
- cloudinary_service.py

## God Nodes (most connected - your core abstractions)
1. `get_collection()` - 38 edges
2. `react` - 34 edges
3. `ReportManager` - 32 edges
4. `useAuthStore` - 29 edges
5. `serialize_doc()` - 26 edges
6. `lucide-react` - 26 edges
7. `ReportDetailSerializer` - 25 edges
8. `Button()` - 21 edges
9. `compilerOptions` - 18 edges
10. `serialize_docs()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `ReportManager` --uses--> `ActionPoints`  [INFERRED]
  backend/reports/models.py → backend/gamification/models.py
- `GamificationManager` --uses--> `UserManager`  [INFERRED]
  backend/gamification/models.py → backend/users/models.py
- `GamificationManager` --uses--> `VolunteerScheme`  [INFERRED]
  backend/gamification/models.py → backend/users/models.py
- `GamificationTests` --uses--> `GamificationManager`  [INFERRED]
  backend/gamification/tests.py → backend/gamification/models.py
- `GamificationLeaderboardAPIView` --uses--> `GamificationManager`  [INFERRED]
  backend/gamification/views.py → backend/gamification/models.py

## Import Cycles
- None detected.

## Communities (38 total, 15 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.05
Nodes (103): App(), ProtectedRoute(), ProtectedRouteProps, Button(), ButtonProps, FilterBar(), FilterBarProps, CardSkeleton() (+95 more)

### Community 1 - "users/views.py"
Cohesion: 0.09
Nodes (11): BadgeTier, UserRole, OTPManager, UserProfileSerializer, UserSyncSerializer, UserTests, SendOTPAPIView, UserProfileAPIView (+3 more)

### Community 2 - "reports/views.py"
Cohesion: 0.06
Nodes (25): PriorityLevel, ReportStatus, EvidenceEntrySerializer, ReportConfirmSerializer, ReportCreateSerializer, ReportDetailSerializer, ReportDisputeSerializer, ReportEvidenceCreateSerializer (+17 more)

### Community 3 - "tokens.py"
Cohesion: 0.21
Nodes (4): ActionTokenTests, generate_action_token(), _get_secret_key(), verify_action_token()

### Community 4 - "ReportManager"
Cohesion: 0.09
Nodes (5): parse_object_id(), serialize_doc(), GamificationTests, ReportManager, UserManager

### Community 5 - "reports/models.py"
Cohesion: 0.09
Nodes (11): is_mock_mode(), verify_location_integrity(), build_box_query(), build_near_query(), geojson_to_coords(), haversine_distance(), is_near_facility(), point_to_geojson() (+3 more)

### Community 6 - "fraud/tests.py"
Cohesion: 0.08
Nodes (6): compute_image_phash(), find_duplicate_reports(), hamming_distance(), detect_screen_recapture(), analyze_report_fraud(), FraudPipelineTests

### Community 8 - "wards/views.py"
Cohesion: 0.15
Nodes (7): WardManager, DepartmentSerializer, WardLeaderboardSerializer, WardSerializer, DepartmentListAPIView, WardLeaderboardAPIView, WardListAPIView

### Community 9 - "GamificationManager"
Cohesion: 0.07
Nodes (11): is_mongo_connected(), HealthCheckAPIView, FraudCheckRequestSerializer, FraudCheckResponseSerializer, FraudCheckAPIView, BadgeSerializer, GamificationLeaderboardEntrySerializer, GamificationSummarySerializer (+3 more)

### Community 10 - "django_apps"
Cohesion: 0.07
Nodes (11): get_db(), get_mongo_client(), get_mongo_db_name(), get_mongo_uri(), init_indexes(), FraudConfig, GamificationConfig, NotificationsConfig (+3 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 12 - "package.json"
Cohesion: 0.10
Nodes (20): name, private, type, version, autoprefixer, axios, clsx, date-fns (+12 more)

### Community 13 - "notifications/views.py"
Cohesion: 0.16
Nodes (5): ActionTokenResponseSerializer, PublicUpdateStatusSerializer, record_token_usage(), GenerateActionTokenAPIView, PublicUpdateAPIView

### Community 14 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, axios, canvas-confetti, clsx, date-fns, leaflet, lucide-react, react (+5 more)

### Community 15 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, autoprefixer, postcss, tailwindcss, @types/canvas-confetti, @types/leaflet, @types/node, @types/react (+5 more)

### Community 16 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, categories, description, display, icons, name, orientation, short_name (+2 more)

### Community 17 - "compilerOptions"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 18 - "vite.config.ts"
Cohesion: 0.40
Nodes (3): vite, vite-plugin-pwa, @vitejs/plugin-react

### Community 19 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, dev, preview

### Community 36 - "get_collection"
Cohesion: 0.14
Nodes (4): get_collection(), hash_otp(), generate_ticket_id(), is_valid_ticket_id()

### Community 37 - "Key Architecture & Features"
Cohesion: 0.13
Nodes (14): 1. In-App Camera Only (`src/components/report/CameraCapture.tsx`), 2. Multi-Reading GPS Consistency & Mock Detection (`src/hooks/useGeolocation.ts`), 3. Hyperlocal 500m Proximity Feed & Duplicate Prevention (`src/components/report/NearbyCheck.tsx`), 4. Interactive Maps & Hotspot Heatmaps (`src/components/map/`), 5. Guaranteed Municipal SLA Countdown (`src/utils/helpers.ts`), 6. Citizen Resolution Verification (`src/pages/ConfirmResolutionPage.tsx`), 7. Token-Based One-Click Officer Dispatch (`src/pages/PublicUpdatePage.tsx`), 8. Ward Resolution Leaderboard & Gamification (`src/components/gamification/`) (+6 more)

### Community 38 - "mongo.py"
Cohesion: 0.13
Nodes (4): serialize_docs(), evaluate_user_badges(), ActionPoints, VolunteerScheme

### Community 40 - "cloudinary_service.py"
Cohesion: 0.06
Nodes (6): build.sh script, main(), WhatsAppBridge, configure_cloudinary(), delete_media(), is_cloudinary_configured()

## Knowledge Gaps
- **11 isolated node(s):** `clsx`, `tailwind-merge`, `@types/canvas-confetti`, `@types/leaflet`, `@types/node` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 353 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `get_collection()` connect `get_collection` to `users/views.py`, `reports/views.py`, `tokens.py`, `ReportManager`, `reports/models.py`, `mongo.py`, `GamificationManager`, `fraud/tests.py`, `reports/tests.py`, `django_apps`, `notifications/views.py`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `ReportManager` (e.g. with `ActionTokenTests` and `ActionPoints`) actually correct?**
  _`ReportManager` has 14 INFERRED edges - model-reasoned connections that need verification._
- **What connects `clsx`, `tailwind-merge`, `@types/canvas-confetti` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05316091954022988 - nodes in this community are weakly interconnected._
- **Why does `init_indexes()` connect `django_apps` to `mongo.py`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Should `users/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.09230769230769231 - nodes in this community are weakly interconnected._
- **Why does `serialize_doc()` connect `ReportManager` to `django_apps`, `reports/models.py`, `notifications/views.py`, `mongo.py`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._