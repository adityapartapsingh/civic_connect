# Graph Report - civic connect  (2026-11-16)

## Corpus Check
- 138 files · ~103,709 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 27 file(s) not represented in the graph (top: .xml 10, (none) 7, .example 3)

## Summary
- 1119 nodes · 2801 edges · 68 communities (36 shown, 32 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 153 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f30211e9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UserManager
- UserProfileSerializer
- validate_indian_phone
- parse_object_id
- get_db
- WardTests
- ProfilePage.tsx
- whatsapp.py
- wards/views.py
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
- services.py
- Key Architecture & Features
- ReportAPITests
- reports/models.py
- CivicUserPrincipal
- ErrorBoundary
- GamificationManager
- mongo.py
- UserTests
- pipeline.py
- RewardsPage.tsx
- ReportManager
- ReportPage.tsx
- users/views.py
- ExampleInstrumentedTest.java
- App.tsx
- re
- validators.py
- WhatsAppBridge
- reports/views.py
- manage.py
- UserProfileSerializer
- com.getcapacitor.BridgeActivity
- capacitor.config.ts

## God Nodes (most connected - your core abstractions)
1. `UserManager` - 58 edges
2. `get_collection()` - 48 edges
3. `UserProfileSerializer` - 41 edges
4. `react` - 39 edges
5. `ReportManager` - 37 edges
6. `useAuthStore` - 37 edges
7. `serialize_doc()` - 36 edges
8. `lucide-react` - 31 edges
9. `useToastStore` - 30 edges
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

## Communities (68 total, 32 thin omitted)

### Community 1 - "UserProfileSerializer"
Cohesion: 0.21
Nodes (3): JWTBearerAuthentication, _require_super_admin(), UserProfileAPIView

### Community 2 - "validate_indian_phone"
Cohesion: 0.11
Nodes (5): BadgeTier, UserSyncSerializer, VolunteerApplicationSerializer, validate_indian_phone(), validate_password_strength()

### Community 4 - "get_db"
Cohesion: 0.07
Nodes (12): get_db(), get_mongo_client(), get_mongo_db_name(), get_mongo_uri(), init_indexes(), _migrate_sparse_to_partial(), FraudConfig, GamificationConfig (+4 more)

### Community 5 - "WardTests"
Cohesion: 0.15
Nodes (3): ReportStatus, route_category_to_department(), WardTests

### Community 6 - "ProfilePage.tsx"
Cohesion: 0.19
Nodes (12): Modal(), ModalProps, badgeIcons, DEFAULT_CIVIC_BADGES, ProfilePage(), CategoryInfo, getWardsForDistrict(), INDIAN_STATES (+4 more)

### Community 7 - "whatsapp.py"
Cohesion: 0.24
Nodes (6): clean_indian_phone(), get_whatsapp_gateway_base_url(), get_whatsapp_gateway_status(), reset_whatsapp_gateway_session(), send_whatsapp_message(), send_whatsapp_otp()

### Community 8 - "wards/views.py"
Cohesion: 0.06
Nodes (12): is_mongo_connected(), HealthCheckAPIView, FraudCheckRequestSerializer, FraudCheckResponseSerializer, FraudCheckAPIView, WardManager, DepartmentSerializer, WardLeaderboardSerializer (+4 more)

### Community 9 - "react"
Cohesion: 0.14
Nodes (35): ProtectedRoute(), ProtectedRouteProps, Button(), ButtonProps, Toast(), PhotoGeoTag, StatusUpdater(), StatusUpdaterProps (+27 more)

### Community 10 - "react"
Cohesion: 0.15
Nodes (20): FilterBar(), FilterBarProps, CardSkeleton(), LoadingSpinnerProps, Pagination(), PaginationProps, StatusBadge(), StatusBadgeProps (+12 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 12 - "package.json"
Cohesion: 0.08
Nodes (23): name, private, type, version, autoprefixer, axios, @capacitor/android, @capacitor/app (+15 more)

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
Cohesion: 0.07
Nodes (43): Leaderboard(), MUNICIPAL_WARDS, BLOCK_REASON_PRESETS, MUNICIPAL_WARDS, TASK_OPTIONS, CIVIC_INTEREST_AREAS, MUNICIPAL_WARDS, VOLUNTEER_SCHEMES (+35 more)

### Community 33 - "get_collection"
Cohesion: 0.15
Nodes (5): get_collection(), ActionTokenTests, generate_action_token(), _get_secret_key(), verify_action_token()

### Community 34 - "IssueMap.tsx"
Cohesion: 0.16
Nodes (18): HeatmapLayer(), HeatmapLayerProps, HeatmapToggle(), HeatmapToggleProps, createCustomPin(), IssueMap(), IssueMapProps, RecenterMap() (+10 more)

### Community 35 - "authentication.py"
Cohesion: 0.11
Nodes (8): _b64url_decode(), _b64url_encode(), _get_signing_key(), IsOfficerOrAdmin, IsSuperAdmin, IsWardAdminOrSuperAdmin, verify_jwt(), hash_otp()

### Community 36 - "services.py"
Cohesion: 0.08
Nodes (7): verify_location_integrity(), compute_image_phash(), find_duplicate_reports(), hamming_distance(), detect_screen_recapture(), analyze_report_fraud(), FraudPipelineTests

### Community 37 - "Key Architecture & Features"
Cohesion: 0.13
Nodes (14): 1. In-App Camera Only (`src/components/report/CameraCapture.tsx`), 2. Multi-Reading GPS Consistency & Mock Detection (`src/hooks/useGeolocation.ts`), 3. Hyperlocal 500m Proximity Feed & Duplicate Prevention (`src/components/report/NearbyCheck.tsx`), 4. Interactive Maps & Hotspot Heatmaps (`src/components/map/`), 5. Guaranteed Municipal SLA Countdown (`src/utils/helpers.ts`), 6. Citizen Resolution Verification (`src/pages/ConfirmResolutionPage.tsx`), 7. Token-Based One-Click Officer Dispatch (`src/pages/PublicUpdatePage.tsx`), 8. Ward Resolution Leaderboard & Gamification (`src/components/gamification/`) (+6 more)

### Community 39 - "reports/models.py"
Cohesion: 0.09
Nodes (12): is_mock_mode(), build_box_query(), build_near_query(), geojson_to_coords(), haversine_distance(), is_near_facility(), point_to_geojson(), validate_coordinates() (+4 more)

### Community 41 - "ErrorBoundary"
Cohesion: 0.25
Nodes (3): ErrorBoundary, Props, State

### Community 44 - "GamificationManager"
Cohesion: 0.10
Nodes (8): GamificationManager, BadgeSerializer, GamificationLeaderboardEntrySerializer, GamificationSummarySerializer, PointTransactionSerializer, GamificationTests, GamificationLeaderboardAPIView, UserGamificationAPIView

### Community 46 - "mongo.py"
Cohesion: 0.12
Nodes (4): find_nearby_active_duplicate(), evaluate_user_badges(), ActionPoints, VolunteerScheme

### Community 49 - "pipeline.py"
Cohesion: 0.19
Nodes (4): merge_duplicate_into_timeline(), verify_hazard_content(), run_report_verification_pipeline(), VerificationResult

### Community 50 - "RewardsPage.tsx"
Cohesion: 0.13
Nodes (16): CITIZEN_REWARDS_CATALOG, COMMUNITY_DISTRICT_CITIZENS, COMMUNITY_INDIA_CITIZENS, COMMUNITY_LOCAL_CITIZENS, getCitizensForState(), getOfficersForState(), IndianState, LeaderboardUser (+8 more)

### Community 51 - "ReportManager"
Cohesion: 0.05
Nodes (28): IsAuthenticatedCivicUser, serialize_doc(), serialize_docs(), PriorityLevel, ReportManager, EvidenceEntrySerializer, ReportConfirmSerializer, ReportCreateSerializer (+20 more)

### Community 52 - "ReportPage.tsx"
Cohesion: 0.23
Nodes (13): CameraCapture(), CameraCaptureProps, CategoryPicker(), CategoryPickerProps, iconMap, CapturedMedia, useCamera(), ReportPage() (+5 more)

### Community 57 - "users/views.py"
Cohesion: 0.10
Nodes (23): UserManager, UserRole, OTPManager, AdminProvisionAPIView, AdminQuickLoginAPIView, AdminRevokeAPIView, AdminRosterAPIView, ChangePasswordAPIView (+15 more)

### Community 60 - "App.tsx"
Cohesion: 0.24
Nodes (12): AdminPortalPage, App(), ConfirmResolutionPage, DashboardPage, MapPage, PublicUpdatePage, RewardsPage, RouteLoadingFallback() (+4 more)

### Community 62 - "validators.py"
Cohesion: 0.29
Nodes (3): check_password_strength(), is_valid_indian_phone(), normalize_phone_number()

### Community 66 - "reports/views.py"
Cohesion: 0.07
Nodes (6): get_gemini_api_key(), analyze_issue_image_data(), get_gemini_api_key(), configure_cloudinary(), delete_media(), is_cloudinary_configured()

## Knowledge Gaps
- **17 isolated node(s):** `@capacitor/android`, `@capacitor/app`, `@capacitor/camera`, `@capacitor/core`, `@capacitor/geolocation` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 503 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UserManager` connect `users/views.py` to `UserManager`, `UserProfileSerializer`, `reports/views.py`, `authentication.py`, `parse_object_id`, `WardTests`, `reports/models.py`, `UserProfileSerializer`, `GamificationManager`, `mongo.py`, `UserTests`, `pipeline.py`, `ReportManager`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Are the 23 inferred relationships involving `UserManager` (e.g. with `merge_duplicate_into_timeline()` and `GamificationManager`) actually correct?**
  _`UserManager` has 23 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@capacitor/android`, `@capacitor/app`, `@capacitor/camera` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UserManager` be split into smaller, more focused modules?**
  _Cohesion score 0.08979591836734693 - nodes in this community are weakly interconnected._
- **Why does `get_collection()` connect `get_collection` to `UserManager`, `UserProfileSerializer`, `reports/views.py`, `parse_object_id`, `get_db`, `services.py`, `WardTests`, `reports/models.py`, `validate_indian_phone`, `UserProfileSerializer`, `GamificationManager`, `get_collection`, `mongo.py`, `pipeline.py`, `ReportManager`, `users/views.py`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `UserProfileSerializer` (e.g. with `BadgeTier` and `UserRole`) actually correct?**
  _`UserProfileSerializer` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Should `validate_indian_phone` be split into smaller, more focused modules?**
  _Cohesion score 0.10952380952380952 - nodes in this community are weakly interconnected._