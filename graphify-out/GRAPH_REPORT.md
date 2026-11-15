# Graph Report - civic connect  (2026-11-16)

## Corpus Check
- 138 files · ~107,375 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 27 file(s) not represented in the graph (top: .xml 10, (none) 7, .example 3)

## Summary
- 1131 nodes · 2839 edges · 76 communities (41 shown, 35 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 157 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `37d4296e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- OTPManager
- UserProfileSerializer
- validate_indian_phone
- UserManager
- get_db
- users/tests.py
- App.tsx
- tokens.py
- wards/views.py
- useAuthStore
- react
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
- get_collection
- IssueMap.tsx
- authentication.py
- services.py
- Key Architecture & Features
- whatsapp.py
- reports/models.py
- CivicUserPrincipal
- ReportManager
- validators.py
- verify_location_integrity
- GamificationManager
- rest_framework
- validate_coordinates
- upload_media
- UserTests
- run_report_verification_pipeline
- RewardsPage.tsx
- reports/views.py
- manage.py
- react
- ai_vision.py
- is_mongo_connected
- serialize_docs
- users/views.py
- ExampleInstrumentedTest.java
- UserProfileSerializer
- llm_verifier.py
- hash_otp
- WhatsAppBridge
- pipeline.py
- useAuthStore
- cloudinary_service.py
- com.getcapacitor.BridgeActivity
- capacitor.config.ts

## God Nodes (most connected - your core abstractions)
1. `UserManager` - 58 edges
2. `get_collection()` - 48 edges
3. `UserProfileSerializer` - 41 edges
4. `react` - 39 edges
5. `ReportManager` - 38 edges
6. `serialize_doc()` - 37 edges
7. `useAuthStore` - 37 edges
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
- `UserProfileAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `VolunteerApplicationReviewAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py

## Import Cycles
- None detected.

## Communities (76 total, 35 thin omitted)

### Community 2 - "validate_indian_phone"
Cohesion: 0.10
Nodes (6): BadgeTier, UserSyncSerializer, VolunteerApplicationSerializer, validate_indian_phone(), validate_password_strength(), UserSyncAPIView

### Community 4 - "get_db"
Cohesion: 0.07
Nodes (12): get_db(), get_mongo_client(), get_mongo_db_name(), get_mongo_uri(), init_indexes(), _migrate_sparse_to_partial(), FraudConfig, GamificationConfig (+4 more)

### Community 6 - "App.tsx"
Cohesion: 0.12
Nodes (18): AdminPortalPage, App(), ConfirmResolutionPage, DashboardPage, MapPage, PublicUpdatePage, RewardsPage, RouteLoadingFallback() (+10 more)

### Community 7 - "tokens.py"
Cohesion: 0.20
Nodes (4): ActionTokenTests, generate_action_token(), _get_secret_key(), verify_action_token()

### Community 8 - "wards/views.py"
Cohesion: 0.09
Nodes (9): WardManager, DepartmentSerializer, WardCreateSerializer, WardLeaderboardSerializer, WardSerializer, WardTests, DepartmentListAPIView, WardLeaderboardAPIView (+1 more)

### Community 9 - "useAuthStore"
Cohesion: 0.23
Nodes (17): Button(), ButtonProps, Modal(), ModalProps, PhotoGeoTag, StatusUpdater(), StatusUpdaterProps, AdminPortalPage() (+9 more)

### Community 10 - "react"
Cohesion: 0.17
Nodes (18): FilterBar(), FilterBarProps, CardSkeleton(), LoadingSpinnerProps, Pagination(), PaginationProps, StatusBadge(), StatusBadgeProps (+10 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 12 - "package.json"
Cohesion: 0.08
Nodes (23): name, private, type, version, autoprefixer, axios, @capacitor/android, @capacitor/app (+15 more)

### Community 13 - "notifications/views.py"
Cohesion: 0.12
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
Cohesion: 0.08
Nodes (38): MUNICIPAL_WARDS, TASK_SPECIALTIES, BLOCK_REASON_PRESETS, MUNICIPAL_WARDS, SuperAdminPortalPage(), TASK_OPTIONS, adaptBackendReportToIssue(), adaptUserProfile() (+30 more)

### Community 33 - "get_collection"
Cohesion: 0.11
Nodes (4): get_collection(), is_mock_mode(), generate_ticket_id(), is_valid_ticket_id()

### Community 34 - "IssueMap.tsx"
Cohesion: 0.16
Nodes (18): TicketListProps, HeatmapLayer(), HeatmapLayerProps, HeatmapToggle(), HeatmapToggleProps, createCustomPin(), IssueMap(), IssueMapProps (+10 more)

### Community 35 - "authentication.py"
Cohesion: 0.16
Nodes (6): _b64url_decode(), _b64url_encode(), _get_signing_key(), IsSuperAdmin, IsWardAdminOrSuperAdmin, verify_jwt()

### Community 36 - "services.py"
Cohesion: 0.10
Nodes (6): verify_location_integrity(), compute_image_phash(), find_duplicate_reports(), hamming_distance(), detect_screen_recapture(), analyze_report_fraud()

### Community 37 - "Key Architecture & Features"
Cohesion: 0.13
Nodes (14): 1. In-App Camera Only (`src/components/report/CameraCapture.tsx`), 2. Multi-Reading GPS Consistency & Mock Detection (`src/hooks/useGeolocation.ts`), 3. Hyperlocal 500m Proximity Feed & Duplicate Prevention (`src/components/report/NearbyCheck.tsx`), 4. Interactive Maps & Hotspot Heatmaps (`src/components/map/`), 5. Guaranteed Municipal SLA Countdown (`src/utils/helpers.ts`), 6. Citizen Resolution Verification (`src/pages/ConfirmResolutionPage.tsx`), 7. Token-Based One-Click Officer Dispatch (`src/pages/PublicUpdatePage.tsx`), 8. Ward Resolution Leaderboard & Gamification (`src/components/gamification/`) (+6 more)

### Community 38 - "whatsapp.py"
Cohesion: 0.24
Nodes (6): clean_indian_phone(), get_whatsapp_gateway_base_url(), get_whatsapp_gateway_status(), reset_whatsapp_gateway_session(), send_whatsapp_message(), send_whatsapp_otp()

### Community 39 - "reports/models.py"
Cohesion: 0.11
Nodes (9): find_nearby_active_duplicate(), evaluate_user_badges(), ActionPoints, VolunteerScheme, haversine_distance(), is_near_facility(), point_to_geojson(), calculate_priority_score() (+1 more)

### Community 41 - "ReportManager"
Cohesion: 0.12
Nodes (3): parse_object_id(), serialize_doc(), ReportManager

### Community 42 - "validators.py"
Cohesion: 0.25
Nodes (3): check_password_strength(), is_valid_indian_phone(), normalize_phone_number()

### Community 44 - "GamificationManager"
Cohesion: 0.10
Nodes (8): GamificationManager, BadgeSerializer, GamificationLeaderboardEntrySerializer, GamificationSummarySerializer, PointTransactionSerializer, GamificationTests, GamificationLeaderboardAPIView, UserGamificationAPIView

### Community 45 - "rest_framework"
Cohesion: 0.22
Nodes (3): FraudCheckRequestSerializer, FraudCheckResponseSerializer, FraudCheckAPIView

### Community 46 - "validate_coordinates"
Cohesion: 0.25
Nodes (4): build_box_query(), build_near_query(), geojson_to_coords(), validate_coordinates()

### Community 47 - "upload_media"
Cohesion: 0.32
Nodes (3): ReportUpvoteCreateSerializer, ReportUpvoteAPIView, upload_media()

### Community 48 - "UserTests"
Cohesion: 0.06
Nodes (3): generate_jwt(), ReportAPITests, UserTests

### Community 49 - "run_report_verification_pipeline"
Cohesion: 0.32
Nodes (3): IsAuthenticatedCivicUser, ReportCreateSerializer, ReportListCreateAPIView

### Community 50 - "RewardsPage.tsx"
Cohesion: 0.09
Nodes (25): badgeIcons, DEFAULT_CIVIC_BADGES, CITIZEN_REWARDS_CATALOG, COMMUNITY_DISTRICT_CITIZENS, COMMUNITY_INDIA_CITIZENS, COMMUNITY_LOCAL_CITIZENS, getCitizensForState(), getOfficersForState() (+17 more)

### Community 51 - "reports/views.py"
Cohesion: 0.11
Nodes (21): IsOfficerOrAdmin, PriorityLevel, ReportStatus, EvidenceEntrySerializer, ReportConfirmSerializer, ReportDetailSerializer, ReportDisputeSerializer, ReportEvidenceCreateSerializer (+13 more)

### Community 53 - "react"
Cohesion: 0.20
Nodes (15): CameraCapture(), CameraCaptureProps, CategoryPicker(), CategoryPickerProps, iconMap, NearbyCheck(), CapturedMedia, useCamera() (+7 more)

### Community 57 - "users/views.py"
Cohesion: 0.11
Nodes (20): UserRole, AdminProvisionAPIView, AdminRevokeAPIView, AdminRosterAPIView, ChangePasswordAPIView, DeleteAccountAPIView, PasswordLoginAPIView, RedeemRewardAPIView (+12 more)

### Community 59 - "UserProfileSerializer"
Cohesion: 0.15
Nodes (3): UserProfileSerializer, AdminQuickLoginAPIView, SuperAdminBlockUserAPIView

### Community 61 - "llm_verifier.py"
Cohesion: 0.16
Nodes (4): get_gemini_api_key(), verify_hazard_content(), calculate_shannon_entropy(), detect_gibberish_or_meaningless()

### Community 64 - "pipeline.py"
Cohesion: 0.24
Nodes (3): merge_duplicate_into_timeline(), run_report_verification_pipeline(), VerificationResult

### Community 65 - "useAuthStore"
Cohesion: 0.12
Nodes (26): Toast(), Leaderboard(), PointsBadge(), Layout(), MobileNav(), ConfirmResolutionPage(), MUNICIPAL_WARDS, CIVIC_INTEREST_AREAS (+18 more)

### Community 66 - "cloudinary_service.py"
Cohesion: 0.12
Nodes (3): configure_cloudinary(), delete_media(), is_cloudinary_configured()

## Knowledge Gaps
- **17 isolated node(s):** `@capacitor/android`, `@capacitor/app`, `@capacitor/camera`, `@capacitor/core`, `@capacitor/geolocation` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 504 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UserManager` connect `UserManager` to `pipeline.py`, `UserProfileSerializer`, `validate_indian_phone`, `authentication.py`, `users/tests.py`, `reports/models.py`, `ReportManager`, `GamificationManager`, `UserTests`, `run_report_verification_pipeline`, `reports/views.py`, `users/views.py`, `UserProfileSerializer`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Are the 23 inferred relationships involving `UserManager` (e.g. with `merge_duplicate_into_timeline()` and `GamificationManager`) actually correct?**
  _`UserManager` has 23 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@capacitor/android`, `@capacitor/app`, `@capacitor/camera` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UserProfileSerializer` be split into smaller, more focused modules?**
  _Cohesion score 0.13768115942028986 - nodes in this community are weakly interconnected._
- **Why does `get_collection()` connect `get_collection` to `pipeline.py`, `UserProfileSerializer`, `validate_indian_phone`, `UserManager`, `get_db`, `services.py`, `users/tests.py`, `reports/models.py`, `tokens.py`, `ReportManager`, `GamificationManager`, `notifications/views.py`, `UserTests`, `reports/views.py`, `serialize_docs`, `users/views.py`, `UserProfileSerializer`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `UserProfileSerializer` (e.g. with `BadgeTier` and `UserRole`) actually correct?**
  _`UserProfileSerializer` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Should `validate_indian_phone` be split into smaller, more focused modules?**
  _Cohesion score 0.10276679841897234 - nodes in this community are weakly interconnected._