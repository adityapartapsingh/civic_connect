# Graph Report - civic connect  (2026-10-20)

## Corpus Check
- 115 files · ~42,146 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 5, .example 2, .conf 1)

## Summary
- 815 nodes · 1912 edges · 51 communities (29 shown, 22 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 76 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `911dfb1a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- users/views.py
- reports/views.py
- tokens.py
- serialize_doc
- reports/models.py
- fraud/tests.py
- GamificationManager
- wards/views.py
- gamification/views.py
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
- index.ts
- vercel.json
- react
- IssueMap.tsx
- authentication.py
- datetime
- Key Architecture & Features
- gamification/models.py
- HomePage.tsx
- cloudinary_service.py
- TicketPage.tsx
- authStore.ts
- CivicUserPrincipal
- ReportAPITests
- Button
- .record_points
- OTPManager
- UserTests
- ErrorBoundary
- IsOfficerOrAdmin

## God Nodes (most connected - your core abstractions)
1. `get_collection()` - 38 edges
2. `react` - 35 edges
3. `ReportManager` - 32 edges
4. `useAuthStore` - 29 edges
5. `lucide-react` - 27 edges
6. `serialize_doc()` - 26 edges
7. `ReportDetailSerializer` - 25 edges
8. `Button()` - 21 edges
9. `Issue` - 18 edges
10. `compilerOptions` - 18 edges

## Surprising Connections (you probably didn't know these)
- `ReportManager` --uses--> `ActionPoints`  [INFERRED]
  backend/reports/models.py → backend/gamification/models.py
- `GamificationManager` --uses--> `UserManager`  [INFERRED]
  backend/gamification/models.py → backend/users/models.py
- `GamificationTests` --uses--> `GamificationManager`  [INFERRED]
  backend/gamification/tests.py → backend/gamification/models.py
- `GamificationLeaderboardAPIView` --uses--> `GamificationManager`  [INFERRED]
  backend/gamification/views.py → backend/gamification/models.py
- `UserGamificationAPIView` --uses--> `GamificationManager`  [INFERRED]
  backend/gamification/views.py → backend/gamification/models.py

## Import Cycles
- None detected.

## Communities (51 total, 22 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.12
Nodes (24): App(), ConfirmResolutionPage, DashboardPage, MapPage, PublicUpdatePage, RouteLoadingFallback(), ProtectedRoute(), ProtectedRouteProps (+16 more)

### Community 1 - "users/views.py"
Cohesion: 0.14
Nodes (9): BadgeTier, UserRole, UserProfileSerializer, UserSyncSerializer, SendOTPAPIView, UserProfileAPIView, UserSyncAPIView, VerifyOTPAPIView (+1 more)

### Community 2 - "reports/views.py"
Cohesion: 0.06
Nodes (25): parse_object_id(), ReportManager, ReportStatus, EvidenceEntrySerializer, ReportConfirmSerializer, ReportCreateSerializer, ReportDetailSerializer, ReportDisputeSerializer (+17 more)

### Community 3 - "tokens.py"
Cohesion: 0.18
Nodes (5): get_collection(), ActionTokenTests, generate_action_token(), _get_secret_key(), verify_action_token()

### Community 5 - "reports/models.py"
Cohesion: 0.06
Nodes (15): is_mock_mode(), PriorityLevel, build_box_query(), build_near_query(), geojson_to_coords(), haversine_distance(), is_near_facility(), point_to_geojson() (+7 more)

### Community 6 - "fraud/tests.py"
Cohesion: 0.06
Nodes (10): verify_location_integrity(), compute_image_phash(), find_duplicate_reports(), hamming_distance(), detect_screen_recapture(), FraudCheckRequestSerializer, FraudCheckResponseSerializer, analyze_report_fraud() (+2 more)

### Community 8 - "wards/views.py"
Cohesion: 0.15
Nodes (7): WardManager, DepartmentSerializer, WardLeaderboardSerializer, WardSerializer, DepartmentListAPIView, WardLeaderboardAPIView, WardListAPIView

### Community 9 - "gamification/views.py"
Cohesion: 0.18
Nodes (6): BadgeSerializer, GamificationLeaderboardEntrySerializer, GamificationSummarySerializer, PointTransactionSerializer, GamificationLeaderboardAPIView, UserGamificationAPIView

### Community 10 - "django_apps"
Cohesion: 0.05
Nodes (13): get_db(), get_mongo_client(), get_mongo_db_name(), get_mongo_uri(), init_indexes(), is_mongo_connected(), HealthCheckAPIView, FraudConfig (+5 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 12 - "package.json"
Cohesion: 0.11
Nodes (18): name, private, type, version, autoprefixer, axios, clsx, date-fns (+10 more)

### Community 13 - "notifications/views.py"
Cohesion: 0.11
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

### Community 20 - "index.ts"
Cohesion: 0.14
Nodes (25): StatusUpdaterProps, adaptBackendReportToIssue(), adaptWardLeaderboardItem(), backendPriorityToFrontend(), backendStatusToFrontend(), frontendPriorityToBackend(), frontendStatusToBackend(), getCategorySlaHours() (+17 more)

### Community 33 - "react"
Cohesion: 0.19
Nodes (17): CameraCapture(), CameraCaptureProps, CategoryPicker(), CategoryPickerProps, iconMap, CapturedMedia, useCamera(), useNearbyReports() (+9 more)

### Community 34 - "IssueMap.tsx"
Cohesion: 0.16
Nodes (15): Leaderboard(), HeatmapToggle(), HeatmapToggleProps, createCustomPin(), IssueMap(), IssueMapProps, RecenterMap(), userLocationIcon (+7 more)

### Community 35 - "authentication.py"
Cohesion: 0.19
Nodes (6): _b64url_decode(), _b64url_encode(), generate_jwt(), _get_signing_key(), IsAuthenticatedCivicUser, verify_jwt()

### Community 37 - "Key Architecture & Features"
Cohesion: 0.13
Nodes (14): 1. In-App Camera Only (`src/components/report/CameraCapture.tsx`), 2. Multi-Reading GPS Consistency & Mock Detection (`src/hooks/useGeolocation.ts`), 3. Hyperlocal 500m Proximity Feed & Duplicate Prevention (`src/components/report/NearbyCheck.tsx`), 4. Interactive Maps & Hotspot Heatmaps (`src/components/map/`), 5. Guaranteed Municipal SLA Countdown (`src/utils/helpers.ts`), 6. Citizen Resolution Verification (`src/pages/ConfirmResolutionPage.tsx`), 7. Token-Based One-Click Officer Dispatch (`src/pages/PublicUpdatePage.tsx`), 8. Ward Resolution Leaderboard & Gamification (`src/components/gamification/`) (+6 more)

### Community 38 - "gamification/models.py"
Cohesion: 0.22
Nodes (4): evaluate_user_badges(), ActionPoints, GamificationManager, VolunteerScheme

### Community 39 - "HomePage.tsx"
Cohesion: 0.23
Nodes (11): FilterBar(), FilterBarProps, CardSkeleton(), LoadingSpinnerProps, Pagination(), PaginationProps, TicketList(), TicketListProps (+3 more)

### Community 40 - "cloudinary_service.py"
Cohesion: 0.06
Nodes (6): build.sh script, main(), WhatsAppBridge, configure_cloudinary(), delete_media(), is_cloudinary_configured()

### Community 41 - "TicketPage.tsx"
Cohesion: 0.32
Nodes (9): Modal(), ModalProps, StatusUpdater(), DashboardPage(), TicketPage(), formatDateTime(), formatRelativeDate(), getSlaInfo() (+1 more)

### Community 42 - "authStore.ts"
Cohesion: 0.23
Nodes (10): Toast(), AuthState, INITIAL_USER, savedToken, savedUserStr, ToastItem, ToastStore, useToastStore (+2 more)

### Community 45 - "Button"
Cohesion: 0.35
Nodes (8): Button(), StatusBadge(), StatusBadgeProps, NearbyCheck(), NearbyCheckProps, NearbyIssueItem, ConfirmResolutionPage(), PublicUpdatePage()

## Knowledge Gaps
- **11 isolated node(s):** `clsx`, `tailwind-merge`, `@types/canvas-confetti`, `@types/leaflet`, `@types/node` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 373 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `get_collection()` connect `tokens.py` to `users/views.py`, `reports/views.py`, `datetime`, `reports/models.py`, `gamification/models.py`, `fraud/tests.py`, `GamificationManager`, `django_apps`, `ReportAPITests`, `notifications/views.py`, `.record_points`, `UserTests`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `ReportManager` (e.g. with `ActionTokenTests` and `ActionPoints`) actually correct?**
  _`ReportManager` has 14 INFERRED edges - model-reasoned connections that need verification._
- **What connects `clsx`, `tailwind-merge`, `@types/canvas-confetti` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12436974789915967 - nodes in this community are weakly interconnected._
- **Why does `serialize_doc()` connect `serialize_doc` to `users/views.py`, `reports/views.py`, `reports/models.py`, `GamificationManager`, `django_apps`, `notifications/views.py`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Should `users/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.14022988505747128 - nodes in this community are weakly interconnected._
- **Should `reports/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.059921710328214396 - nodes in this community are weakly interconnected._