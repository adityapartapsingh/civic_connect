# Graph Report - civic connect  (2026-11-04)

## Corpus Check
- 125 files · ~82,883 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 5, .example 2, .conf 1)

## Summary
- 1009 nodes · 2525 edges · 65 communities (36 shown, 29 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 121 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2d8cd261`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- users/views.py
- ReportManager
- tokens.py
- UserManager
- reports/models.py
- fraud/tests.py
- mongo.py
- rest_framework
- RewardsPage.tsx
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
- otp.py
- Key Architecture & Features
- users/models.py
- HomePage.tsx
- useAuthStore
- useToastStore
- JWTBearerAuthentication
- ReportAPITests
- reports/views.py
- GamificationManager
- generate_jwt
- .upsert_user
- ErrorBoundary
- detect_gibberish_or_meaningless
- reports/urls.py
- llm_verifier.py
- cloudinary_service.py
- .create_report
- civic_connect/urls.py
- run_report_verification_pipeline
- upload_media
- manage.py
- WhatsAppBridge
- VolunteerApplicationSerializer
- WardTests
- validate_password_strength
- ReportUpvoteAPIView
- main.tsx

## God Nodes (most connected - your core abstractions)
1. `get_collection()` - 48 edges
2. `UserManager` - 47 edges
3. `react` - 39 edges
4. `ReportManager` - 37 edges
5. `useAuthStore` - 37 edges
6. `serialize_doc()` - 33 edges
7. `UserProfileSerializer` - 33 edges
8. `lucide-react` - 31 edges
9. `useToastStore` - 28 edges
10. `UserTests` - 26 edges

## Surprising Connections (you probably didn't know these)
- `AdminProvisionAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `AdminRevokeAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `VolunteerApplicationReviewAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `VolunteerApplicationsAdminAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `merge_duplicate_into_timeline()` --uses--> `ActionPoints`  [INFERRED]
  backend/fraud/duplicates.py → backend/gamification/models.py

## Import Cycles
- None detected.

## Communities (65 total, 29 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.13
Nodes (24): AdminPortalPage, App(), ConfirmResolutionPage, DashboardPage, MapPage, PublicUpdatePage, RewardsPage, RouteLoadingFallback() (+16 more)

### Community 1 - "users/views.py"
Cohesion: 0.09
Nodes (20): BadgeTier, UserRole, OTPManager, UserProfileSerializer, UserSyncSerializer, AdminProvisionAPIView, AdminQuickLoginAPIView, AdminRevokeAPIView (+12 more)

### Community 3 - "tokens.py"
Cohesion: 0.16
Nodes (6): get_collection(), ActionTokenTests, generate_action_token(), _get_secret_key(), record_token_usage(), verify_action_token()

### Community 5 - "reports/models.py"
Cohesion: 0.10
Nodes (10): find_nearby_active_duplicate(), ActionPoints, build_box_query(), build_near_query(), geojson_to_coords(), haversine_distance(), is_near_facility(), point_to_geojson() (+2 more)

### Community 6 - "fraud/tests.py"
Cohesion: 0.08
Nodes (7): verify_location_integrity(), compute_image_phash(), find_duplicate_reports(), hamming_distance(), detect_screen_recapture(), analyze_report_fraud(), FraudPipelineTests

### Community 7 - "mongo.py"
Cohesion: 0.11
Nodes (9): get_db(), get_mongo_client(), get_mongo_db_name(), get_mongo_uri(), init_indexes(), is_mongo_connected(), _migrate_sparse_to_partial(), serialize_doc() (+1 more)

### Community 8 - "rest_framework"
Cohesion: 0.06
Nodes (16): FraudCheckRequestSerializer, FraudCheckResponseSerializer, FraudCheckAPIView, BadgeSerializer, GamificationLeaderboardEntrySerializer, GamificationSummarySerializer, PointTransactionSerializer, GamificationLeaderboardAPIView (+8 more)

### Community 9 - "RewardsPage.tsx"
Cohesion: 0.09
Nodes (24): badgeIcons, DEFAULT_CIVIC_BADGES, CITIZEN_REWARDS_CATALOG, COMMUNITY_DISTRICT_CITIZENS, COMMUNITY_INDIA_CITIZENS, COMMUNITY_LOCAL_CITIZENS, getCitizensForState(), getOfficersForState() (+16 more)

### Community 10 - "django_apps"
Cohesion: 0.10
Nodes (6): FraudConfig, GamificationConfig, NotificationsConfig, ReportsConfig, UsersConfig, WardsConfig

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 12 - "package.json"
Cohesion: 0.11
Nodes (18): name, private, type, version, autoprefixer, axios, clsx, date-fns (+10 more)

### Community 13 - "notifications/views.py"
Cohesion: 0.18
Nodes (4): ActionTokenResponseSerializer, PublicUpdateStatusSerializer, GenerateActionTokenAPIView, PublicUpdateAPIView

### Community 14 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, axios, canvas-confetti, clsx, date-fns, leaflet, leaflet.heat, lucide-react (+6 more)

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
Cohesion: 0.12
Nodes (25): StatusBadgeProps, DEFAULT_COORDS, GeolocationState, adaptBackendReportToIssue(), adaptUserProfile(), adaptWardLeaderboardItem(), backendPriorityToFrontend(), backendStatusToFrontend() (+17 more)

### Community 33 - "react"
Cohesion: 0.23
Nodes (14): CameraCapture(), CameraCaptureProps, CategoryPicker(), CategoryPickerProps, iconMap, CapturedMedia, useCamera(), ReportPage() (+6 more)

### Community 34 - "IssueMap.tsx"
Cohesion: 0.22
Nodes (15): TicketListProps, HeatmapLayer(), HeatmapLayerProps, HeatmapToggle(), HeatmapToggleProps, createCustomPin(), IssueMap(), IssueMapProps (+7 more)

### Community 35 - "authentication.py"
Cohesion: 0.08
Nodes (9): _b64url_decode(), _b64url_encode(), CivicUserPrincipal, _get_signing_key(), IsAuthenticatedCivicUser, IsOfficerOrAdmin, IsSuperAdmin, IsWardAdminOrSuperAdmin (+1 more)

### Community 36 - "otp.py"
Cohesion: 0.18
Nodes (3): hash_otp(), generate_ticket_id(), is_valid_ticket_id()

### Community 37 - "Key Architecture & Features"
Cohesion: 0.13
Nodes (14): 1. In-App Camera Only (`src/components/report/CameraCapture.tsx`), 2. Multi-Reading GPS Consistency & Mock Detection (`src/hooks/useGeolocation.ts`), 3. Hyperlocal 500m Proximity Feed & Duplicate Prevention (`src/components/report/NearbyCheck.tsx`), 4. Interactive Maps & Hotspot Heatmaps (`src/components/map/`), 5. Guaranteed Municipal SLA Countdown (`src/utils/helpers.ts`), 6. Citizen Resolution Verification (`src/pages/ConfirmResolutionPage.tsx`), 7. Token-Based One-Click Officer Dispatch (`src/pages/PublicUpdatePage.tsx`), 8. Ward Resolution Leaderboard & Gamification (`src/components/gamification/`) (+6 more)

### Community 39 - "HomePage.tsx"
Cohesion: 0.18
Nodes (19): FilterBar(), FilterBarProps, CardSkeleton(), LoadingSpinnerProps, Pagination(), PaginationProps, StatusBadge(), TicketList() (+11 more)

### Community 41 - "useAuthStore"
Cohesion: 0.15
Nodes (23): ProtectedRoute(), ProtectedRouteProps, Button(), ButtonProps, Modal(), ModalProps, PhotoGeoTag, StatusUpdater() (+15 more)

### Community 42 - "useToastStore"
Cohesion: 0.16
Nodes (19): Toast(), Layout(), MobileNav(), AdminPortalPage(), MUNICIPAL_WARDS, TASK_SPECIALTIES, MUNICIPAL_WARDS, SuperAdminPortalPage() (+11 more)

### Community 45 - "reports/views.py"
Cohesion: 0.16
Nodes (12): PriorityLevel, EvidenceEntrySerializer, ReportConfirmSerializer, ReportCreateSerializer, ReportDetailSerializer, ReportDisputeSerializer, ReportEvidenceCreateSerializer, StatusHistoryEntrySerializer (+4 more)

### Community 46 - "GamificationManager"
Cohesion: 0.15
Nodes (3): evaluate_user_badges(), GamificationManager, GamificationTests

### Community 49 - "ErrorBoundary"
Cohesion: 0.25
Nodes (3): ErrorBoundary, Props, State

### Community 50 - "detect_gibberish_or_meaningless"
Cohesion: 0.13
Nodes (5): calculate_shannon_entropy(), detect_gibberish_or_meaningless(), check_password_strength(), is_valid_indian_phone(), normalize_phone_number()

### Community 51 - "reports/urls.py"
Cohesion: 0.14
Nodes (6): ReportMapPinSerializer, FeedReportsAPIView, MapReportsAPIView, NearbyReportsAPIView, ReportDetailAPIView, ReportTicketAPIView

### Community 53 - "cloudinary_service.py"
Cohesion: 0.24
Nodes (3): configure_cloudinary(), delete_media(), is_cloudinary_configured()

### Community 54 - ".create_report"
Cohesion: 0.22
Nodes (3): is_mock_mode(), route_category_to_department(), route_location_to_ward()

### Community 56 - "run_report_verification_pipeline"
Cohesion: 0.25
Nodes (3): merge_duplicate_into_timeline(), run_report_verification_pipeline(), VerificationResult

### Community 57 - "upload_media"
Cohesion: 0.32
Nodes (3): ReportStatusUpdateSerializer, ReportStatusUpdateAPIView, upload_media()

## Knowledge Gaps
- **11 isolated node(s):** `clsx`, `tailwind-merge`, `@types/canvas-confetti`, `@types/leaflet`, `@types/node` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 458 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `init_indexes()` connect `mongo.py` to `django_apps`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `UserManager` (e.g. with `merge_duplicate_into_timeline()` and `GamificationManager`) actually correct?**
  _`UserManager` has 19 INFERRED edges - model-reasoned connections that need verification._
- **What connects `clsx`, `tailwind-merge`, `@types/canvas-confetti` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12698412698412698 - nodes in this community are weakly interconnected._
- **Why does `get_collection()` connect `tokens.py` to `users/views.py`, `otp.py`, `reports/models.py`, `fraud/tests.py`, `mongo.py`, `users/models.py`, `UserManager`, `JWTBearerAuthentication`, `ReportAPITests`, `notifications/views.py`, `GamificationManager`, `reports/views.py`, `.upsert_user`, `.create_report`, `run_report_verification_pipeline`, `VolunteerApplicationSerializer`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `ReportManager` (e.g. with `run_report_verification_pipeline()` and `ActionTokenTests`) actually correct?**
  _`ReportManager` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Should `users/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.09224489795918367 - nodes in this community are weakly interconnected._