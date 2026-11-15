# Graph Report - civic connect  (2026-11-16)

## Corpus Check
- 142 files · ~105,711 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 27 file(s) not represented in the graph (top: .xml 10, (none) 7, .example 3)

## Summary
- 1127 nodes · 2871 edges · 81 communities (40 shown, 41 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 153 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `02883c2e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UserManager
- UserProfileSerializer
- validate_password_strength
- get_collection
- get_db
- WardTests
- typing
- whatsapp.py
- rest_framework
- react
- react
- compilerOptions
- package.json
- get_collection
- dependencies
- devDependencies
- manifest.json
- compilerOptions
- vite.config.ts
- scripts
- index.ts
- vercel.json
- get_collection
- IssueMap.tsx
- authentication.py
- FraudPipelineTests
- Key Architecture & Features
- ReportAPITests
- reports/models.py
- CivicUserPrincipal
- ai_vision.py
- useAuthStore
- ReportDetailSerializer
- gamification/views.py
- reports/models.py
- reports/views.py
- UserTests
- duplicates.py
- RewardsPage.tsx
- ReportManager
- ReportPage.tsx
- rest_framework
- civic_connect/urls.py
- OTPManager
- analyze_report_fraud
- users/views.py
- ExampleInstrumentedTest.java
- serialize_docs
- App.tsx
- re
- validators.py
- WhatsAppBridge
- WardManager
- llm_verifier.py
- cloudinary_service.py
- run_report_verification_pipeline
- manage.py
- IsOfficerOrAdmin
- AdminQuickLoginAPIView
- com.getcapacitor.BridgeActivity
- capacitor.config.ts

## God Nodes (most connected - your core abstractions)
1. `UserManager` - 58 edges
2. `get_collection()` - 48 edges
3. `useAuthStore` - 45 edges
4. `react` - 43 edges
5. `UserProfileSerializer` - 41 edges
6. `useToastStore` - 38 edges
7. `ReportManager` - 37 edges
8. `serialize_doc()` - 36 edges
9. `lucide-react` - 35 edges
10. `UserTests` - 28 edges

## Surprising Connections (you probably didn't know these)
- `AdminProvisionAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `AdminRevokeAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `AdminRosterAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `VolunteerApplicationReviewAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `VolunteerApplicationsAdminAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py

## Import Cycles
- None detected.

## Communities (81 total, 41 thin omitted)

### Community 0 - "UserManager"
Cohesion: 0.08
Nodes (3): parse_object_id(), normalize_phone(), UserManager

### Community 1 - "UserProfileSerializer"
Cohesion: 0.12
Nodes (5): JWTBearerAuthentication, UserProfileSerializer, _require_super_admin(), SuperAdminUsersAPIView, UserProfileAPIView

### Community 2 - "validate_password_strength"
Cohesion: 0.18
Nodes (3): UserSyncSerializer, validate_password_strength(), UserSyncAPIView

### Community 3 - "get_collection"
Cohesion: 0.12
Nodes (4): get_collection(), hash_otp(), generate_ticket_id(), is_valid_ticket_id()

### Community 4 - "get_db"
Cohesion: 0.06
Nodes (12): get_db(), get_mongo_client(), get_mongo_db_name(), get_mongo_uri(), init_indexes(), _migrate_sparse_to_partial(), FraudConfig, GamificationConfig (+4 more)

### Community 7 - "whatsapp.py"
Cohesion: 0.24
Nodes (6): clean_indian_phone(), get_whatsapp_gateway_base_url(), get_whatsapp_gateway_status(), reset_whatsapp_gateway_session(), send_whatsapp_message(), send_whatsapp_otp()

### Community 8 - "rest_framework"
Cohesion: 0.20
Nodes (6): DepartmentSerializer, WardLeaderboardSerializer, WardSerializer, DepartmentListAPIView, WardLeaderboardAPIView, WardListAPIView

### Community 9 - "react"
Cohesion: 0.21
Nodes (17): ProtectedRouteProps, Button(), ButtonProps, Modal(), ModalProps, StatusBadge(), StatusBadgeProps, PhotoGeoTag (+9 more)

### Community 10 - "react"
Cohesion: 0.13
Nodes (23): FilterBar(), FilterBarProps, CardSkeleton(), LoadingSpinnerProps, Pagination(), PaginationProps, TicketList(), TicketListProps (+15 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 12 - "package.json"
Cohesion: 0.08
Nodes (25): name, private, type, version, autoprefixer, axios, canvas-confetti, @capacitor/android (+17 more)

### Community 13 - "get_collection"
Cohesion: 0.16
Nodes (5): ActionTokenResponseSerializer, PublicUpdateStatusSerializer, record_token_usage(), GenerateActionTokenAPIView, PublicUpdateAPIView

### Community 14 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, axios, canvas-confetti, @capacitor/android, @capacitor/app, @capacitor/camera, @capacitor/cli, @capacitor/core (+13 more)

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
Cohesion: 0.25
Nodes (8): scripts, build, cap:build, cap:open, cap:run, cap:sync, dev, preview

### Community 20 - "index.ts"
Cohesion: 0.06
Nodes (49): Leaderboard(), DEFAULT_COORDS, GeolocationState, MUNICIPAL_WARDS, BLOCK_REASON_PRESETS, MUNICIPAL_WARDS, TASK_OPTIONS, CIVIC_INTEREST_AREAS (+41 more)

### Community 33 - "get_collection"
Cohesion: 0.22
Nodes (4): ActionTokenTests, generate_action_token(), _get_secret_key(), verify_action_token()

### Community 34 - "IssueMap.tsx"
Cohesion: 0.23
Nodes (14): HeatmapLayer(), HeatmapLayerProps, HeatmapToggle(), HeatmapToggleProps, createCustomPin(), IssueMap(), IssueMapProps, RecenterMap() (+6 more)

### Community 35 - "authentication.py"
Cohesion: 0.15
Nodes (6): _b64url_decode(), _b64url_encode(), _get_signing_key(), IsSuperAdmin, IsWardAdminOrSuperAdmin, verify_jwt()

### Community 36 - "FraudPipelineTests"
Cohesion: 0.15
Nodes (3): compute_image_phash(), hamming_distance(), FraudPipelineTests

### Community 37 - "Key Architecture & Features"
Cohesion: 0.13
Nodes (14): 1. In-App Camera Only (`src/components/report/CameraCapture.tsx`), 2. Multi-Reading GPS Consistency & Mock Detection (`src/hooks/useGeolocation.ts`), 3. Hyperlocal 500m Proximity Feed & Duplicate Prevention (`src/components/report/NearbyCheck.tsx`), 4. Interactive Maps & Hotspot Heatmaps (`src/components/map/`), 5. Guaranteed Municipal SLA Countdown (`src/utils/helpers.ts`), 6. Citizen Resolution Verification (`src/pages/ConfirmResolutionPage.tsx`), 7. Token-Based One-Click Officer Dispatch (`src/pages/PublicUpdatePage.tsx`), 8. Ward Resolution Leaderboard & Gamification (`src/components/gamification/`) (+6 more)

### Community 39 - "reports/models.py"
Cohesion: 0.13
Nodes (9): is_mock_mode(), build_box_query(), build_near_query(), geojson_to_coords(), haversine_distance(), is_near_facility(), point_to_geojson(), validate_coordinates() (+1 more)

### Community 42 - "useAuthStore"
Cohesion: 0.28
Nodes (17): Toast(), PointsBadge(), CitizenLayout(), Layout(), MobileNav(), OfficerLayout(), SuperAdminLayout(), WardAdminLayout() (+9 more)

### Community 43 - "ReportDetailSerializer"
Cohesion: 0.18
Nodes (11): ReportConfirmSerializer, ReportDetailSerializer, ReportUpvoteCreateSerializer, FeedReportsAPIView, NearbyReportsAPIView, ReportAnalyzeImageAPIView, ReportConfirmAPIView, ReportDetailAPIView (+3 more)

### Community 44 - "gamification/views.py"
Cohesion: 0.18
Nodes (6): BadgeSerializer, GamificationLeaderboardEntrySerializer, GamificationSummarySerializer, PointTransactionSerializer, GamificationLeaderboardAPIView, UserGamificationAPIView

### Community 46 - "reports/models.py"
Cohesion: 0.14
Nodes (4): evaluate_user_badges(), GamificationManager, GamificationTests, VolunteerScheme

### Community 47 - "reports/views.py"
Cohesion: 0.19
Nodes (10): ReportStatus, EvidenceEntrySerializer, ReportDisputeSerializer, ReportEvidenceCreateSerializer, ReportMapPinSerializer, ReportStatusUpdateSerializer, StatusHistoryEntrySerializer, MapReportsAPIView (+2 more)

### Community 49 - "duplicates.py"
Cohesion: 0.15
Nodes (5): find_nearby_active_duplicate(), merge_duplicate_into_timeline(), VerificationResult, ActionPoints, calculate_priority_score()

### Community 50 - "RewardsPage.tsx"
Cohesion: 0.09
Nodes (26): badgeIcons, DEFAULT_CIVIC_BADGES, ProfilePage(), CITIZEN_REWARDS_CATALOG, COMMUNITY_DISTRICT_CITIZENS, COMMUNITY_INDIA_CITIZENS, COMMUNITY_LOCAL_CITIZENS, getCitizensForState() (+18 more)

### Community 52 - "ReportPage.tsx"
Cohesion: 0.23
Nodes (13): CameraCapture(), CameraCaptureProps, CategoryPicker(), CategoryPickerProps, iconMap, CapturedMedia, useCamera(), ReportPage() (+5 more)

### Community 53 - "rest_framework"
Cohesion: 0.21
Nodes (3): FraudCheckRequestSerializer, FraudCheckResponseSerializer, FraudCheckAPIView

### Community 56 - "analyze_report_fraud"
Cohesion: 0.17
Nodes (3): verify_location_integrity(), find_duplicate_reports(), analyze_report_fraud()

### Community 57 - "users/views.py"
Cohesion: 0.08
Nodes (22): BadgeTier, UserRole, OTPManager, VolunteerApplicationSerializer, AdminProvisionAPIView, AdminRevokeAPIView, AdminRosterAPIView, ChangePasswordAPIView (+14 more)

### Community 59 - "serialize_docs"
Cohesion: 0.22
Nodes (4): IsAuthenticatedCivicUser, serialize_docs(), ReportCreateSerializer, ReportListCreateAPIView

### Community 60 - "App.tsx"
Cohesion: 0.14
Nodes (15): AdminPortalPage, App(), ConfirmResolutionPage, DashboardPage, MapPage, PublicUpdatePage, RewardsPage, RouteLoadingFallback() (+7 more)

### Community 62 - "validators.py"
Cohesion: 0.25
Nodes (3): check_password_strength(), is_valid_indian_phone(), normalize_phone_number()

### Community 66 - "cloudinary_service.py"
Cohesion: 0.14
Nodes (5): PriorityLevel, configure_cloudinary(), delete_media(), is_cloudinary_configured(), upload_media()

## Knowledge Gaps
- **17 isolated node(s):** `@capacitor/android`, `@capacitor/app`, `@capacitor/camera`, `@capacitor/core`, `@capacitor/geolocation` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 503 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UserManager` connect `UserManager` to `UserProfileSerializer`, `validate_password_strength`, `authentication.py`, `reports/models.py`, `AdminQuickLoginAPIView`, `reports/models.py`, `reports/views.py`, `UserTests`, `duplicates.py`, `ReportManager`, `users/views.py`, `serialize_docs`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Are the 23 inferred relationships involving `UserManager` (e.g. with `merge_duplicate_into_timeline()` and `GamificationManager`) actually correct?**
  _`UserManager` has 23 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@capacitor/android`, `@capacitor/app`, `@capacitor/camera` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UserManager` be split into smaller, more focused modules?**
  _Cohesion score 0.07629288274449565 - nodes in this community are weakly interconnected._
- **Why does `get_collection()` connect `get_collection` to `UserManager`, `get_collection`, `cloudinary_service.py`, `UserProfileSerializer`, `get_db`, `typing`, `.get_leaderboard`, `reports/models.py`, `get_collection`, `reports/models.py`, `reports/views.py`, `duplicates.py`, `ReportManager`, `OTPManager`, `analyze_report_fraud`, `users/views.py`, `serialize_docs`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `UserProfileSerializer` (e.g. with `BadgeTier` and `UserRole`) actually correct?**
  _`UserProfileSerializer` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Should `UserProfileSerializer` be split into smaller, more focused modules?**
  _Cohesion score 0.12413793103448276 - nodes in this community are weakly interconnected._