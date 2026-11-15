# Graph Report - civic connect  (2026-11-16)

## Corpus Check
- 138 files · ~105,473 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 27 file(s) not represented in the graph (top: .xml 10, (none) 7, .example 3)

## Summary
- 1121 nodes · 2805 edges · 75 communities (39 shown, 36 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 153 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `777d1c55`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- .upsert_user
- UserProfileSerializer
- validate_indian_phone
- UserManager
- get_db
- WardTests
- useToastStore
- whatsapp.py
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
- ReportAPITests
- reports/models.py
- CivicUserPrincipal
- ReportManager
- reports/serializers.py
- verify_location_integrity
- GamificationManager
- users/models.py
- serialize_docs
- UserTests
- run_report_verification_pipeline
- RewardsPage.tsx
- reports/views.py
- ProfilePage.tsx
- react
- ai_vision.py
- IsSuperAdmin
- main.tsx
- users/views.py
- ExampleInstrumentedTest.java
- App.tsx
- llm_verifier.py
- validators.py
- WhatsAppBridge
- cloudinary_service.py
- manage.py
- com.getcapacitor.BridgeActivity
- capacitor.config.ts

## God Nodes (most connected - your core abstractions)
1. `UserManager` - 58 edges
2. `get_collection()` - 48 edges
3. `UserProfileSerializer` - 41 edges
4. `react` - 39 edges
5. `ReportManager` - 38 edges
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
- `WhatsAppAdminResetAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `WhatsAppAdminStatusAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py

## Import Cycles
- None detected.

## Communities (75 total, 36 thin omitted)

### Community 1 - "UserProfileSerializer"
Cohesion: 0.15
Nodes (5): JWTBearerAuthentication, VolunteerApplicationSerializer, UserProfileAPIView, VolunteerApplicationReviewAPIView, VolunteerApplicationsAdminAPIView

### Community 2 - "validate_indian_phone"
Cohesion: 0.09
Nodes (7): BadgeTier, UserProfileSerializer, UserSyncSerializer, validate_indian_phone(), validate_password_strength(), AdminQuickLoginAPIView, UserSyncAPIView

### Community 4 - "get_db"
Cohesion: 0.07
Nodes (12): get_db(), get_mongo_client(), get_mongo_db_name(), get_mongo_uri(), init_indexes(), _migrate_sparse_to_partial(), FraudConfig, GamificationConfig (+4 more)

### Community 5 - "WardTests"
Cohesion: 0.15
Nodes (4): is_mock_mode(), route_category_to_department(), route_location_to_ward(), WardTests

### Community 6 - "useToastStore"
Cohesion: 0.11
Nodes (24): Toast(), PointsBadge(), Layout(), MobileNav(), LoginPage(), MUNICIPAL_WARDS, CIVIC_INTEREST_AREAS, MUNICIPAL_WARDS (+16 more)

### Community 7 - "whatsapp.py"
Cohesion: 0.24
Nodes (6): clean_indian_phone(), get_whatsapp_gateway_base_url(), get_whatsapp_gateway_status(), reset_whatsapp_gateway_session(), send_whatsapp_message(), send_whatsapp_otp()

### Community 8 - "wards/views.py"
Cohesion: 0.15
Nodes (7): WardManager, DepartmentSerializer, WardLeaderboardSerializer, WardSerializer, DepartmentListAPIView, WardLeaderboardAPIView, WardListAPIView

### Community 9 - "useAuthStore"
Cohesion: 0.21
Nodes (21): Button(), ButtonProps, StatusBadge(), PhotoGeoTag, StatusUpdater(), StatusUpdaterProps, NearbyCheck(), NearbyCheckProps (+13 more)

### Community 10 - "react"
Cohesion: 0.22
Nodes (11): FilterBar(), FilterBarProps, CardSkeleton(), LoadingSpinnerProps, Pagination(), PaginationProps, TicketList(), TicketListProps (+3 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 12 - "package.json"
Cohesion: 0.08
Nodes (23): name, private, type, version, autoprefixer, axios, @capacitor/android, @capacitor/app (+15 more)

### Community 13 - "notifications/views.py"
Cohesion: 0.05
Nodes (14): is_mongo_connected(), HealthCheckAPIView, FraudCheckRequestSerializer, FraudCheckResponseSerializer, FraudCheckAPIView, ActionTokenResponseSerializer, PublicUpdateStatusSerializer, ActionTokenTests (+6 more)

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
Nodes (39): StatusBadgeProps, Leaderboard(), MUNICIPAL_WARDS, TASK_SPECIALTIES, BLOCK_REASON_PRESETS, MUNICIPAL_WARDS, SuperAdminPortalPage(), TASK_OPTIONS (+31 more)

### Community 33 - "get_collection"
Cohesion: 0.12
Nodes (3): get_collection(), generate_ticket_id(), is_valid_ticket_id()

### Community 34 - "IssueMap.tsx"
Cohesion: 0.16
Nodes (18): HeatmapLayer(), HeatmapLayerProps, HeatmapToggle(), HeatmapToggleProps, createCustomPin(), IssueMap(), IssueMapProps, RecenterMap() (+10 more)

### Community 35 - "authentication.py"
Cohesion: 0.20
Nodes (5): _b64url_decode(), _b64url_encode(), _get_signing_key(), verify_jwt(), hash_otp()

### Community 36 - "services.py"
Cohesion: 0.11
Nodes (5): compute_image_phash(), find_duplicate_reports(), hamming_distance(), detect_screen_recapture(), analyze_report_fraud()

### Community 37 - "Key Architecture & Features"
Cohesion: 0.13
Nodes (14): 1. In-App Camera Only (`src/components/report/CameraCapture.tsx`), 2. Multi-Reading GPS Consistency & Mock Detection (`src/hooks/useGeolocation.ts`), 3. Hyperlocal 500m Proximity Feed & Duplicate Prevention (`src/components/report/NearbyCheck.tsx`), 4. Interactive Maps & Hotspot Heatmaps (`src/components/map/`), 5. Guaranteed Municipal SLA Countdown (`src/utils/helpers.ts`), 6. Citizen Resolution Verification (`src/pages/ConfirmResolutionPage.tsx`), 7. Token-Based One-Click Officer Dispatch (`src/pages/PublicUpdatePage.tsx`), 8. Ward Resolution Leaderboard & Gamification (`src/components/gamification/`) (+6 more)

### Community 39 - "reports/models.py"
Cohesion: 0.11
Nodes (10): find_nearby_active_duplicate(), merge_duplicate_into_timeline(), build_box_query(), build_near_query(), geojson_to_coords(), haversine_distance(), is_near_facility(), point_to_geojson() (+2 more)

### Community 41 - "ReportManager"
Cohesion: 0.14
Nodes (3): parse_object_id(), serialize_doc(), ReportManager

### Community 42 - "reports/serializers.py"
Cohesion: 0.14
Nodes (8): IsOfficerOrAdmin, PriorityLevel, ReportStatus, EvidenceEntrySerializer, ReportStatusUpdateSerializer, StatusHistoryEntrySerializer, ReportStatusUpdateAPIView, upload_media()

### Community 44 - "GamificationManager"
Cohesion: 0.10
Nodes (8): GamificationManager, BadgeSerializer, GamificationLeaderboardEntrySerializer, GamificationSummarySerializer, PointTransactionSerializer, GamificationTests, GamificationLeaderboardAPIView, UserGamificationAPIView

### Community 46 - "users/models.py"
Cohesion: 0.19
Nodes (3): evaluate_user_badges(), ActionPoints, VolunteerScheme

### Community 49 - "run_report_verification_pipeline"
Cohesion: 0.18
Nodes (5): IsAuthenticatedCivicUser, run_report_verification_pipeline(), VerificationResult, ReportCreateSerializer, ReportListCreateAPIView

### Community 50 - "RewardsPage.tsx"
Cohesion: 0.13
Nodes (16): CITIZEN_REWARDS_CATALOG, COMMUNITY_DISTRICT_CITIZENS, COMMUNITY_INDIA_CITIZENS, COMMUNITY_LOCAL_CITIZENS, getCitizensForState(), getOfficersForState(), IndianState, LeaderboardUser (+8 more)

### Community 51 - "reports/views.py"
Cohesion: 0.15
Nodes (15): ReportConfirmSerializer, ReportDetailSerializer, ReportDisputeSerializer, ReportEvidenceCreateSerializer, ReportMapPinSerializer, ReportUpvoteCreateSerializer, MapReportsAPIView, NearbyReportsAPIView (+7 more)

### Community 52 - "ProfilePage.tsx"
Cohesion: 0.14
Nodes (16): Modal(), ModalProps, CategoryPickerProps, iconMap, badgeIcons, DEFAULT_CIVIC_BADGES, ProfilePage(), AIAnalysisResult (+8 more)

### Community 53 - "react"
Cohesion: 0.29
Nodes (11): CameraCapture(), CameraCaptureProps, CategoryPicker(), CapturedMedia, useCamera(), useNearbyReports(), ReportPage(), analyzeIssueImage() (+3 more)

### Community 57 - "users/views.py"
Cohesion: 0.11
Nodes (19): UserRole, OTPManager, AdminProvisionAPIView, AdminRevokeAPIView, AdminRosterAPIView, ChangePasswordAPIView, DeleteAccountAPIView, PasswordLoginAPIView (+11 more)

### Community 60 - "App.tsx"
Cohesion: 0.15
Nodes (15): AdminPortalPage, App(), ConfirmResolutionPage, DashboardPage, MapPage, PublicUpdatePage, RewardsPage, RouteLoadingFallback() (+7 more)

### Community 61 - "llm_verifier.py"
Cohesion: 0.15
Nodes (4): get_gemini_api_key(), verify_hazard_content(), calculate_shannon_entropy(), detect_gibberish_or_meaningless()

### Community 62 - "validators.py"
Cohesion: 0.24
Nodes (3): check_password_strength(), is_valid_indian_phone(), normalize_phone_number()

### Community 66 - "cloudinary_service.py"
Cohesion: 0.21
Nodes (3): configure_cloudinary(), delete_media(), is_cloudinary_configured()

## Knowledge Gaps
- **17 isolated node(s):** `@capacitor/android`, `@capacitor/app`, `@capacitor/camera`, `@capacitor/core`, `@capacitor/geolocation` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 504 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UserManager` connect `UserManager` to `.upsert_user`, `get_collection`, `UserProfileSerializer`, `authentication.py`, `validate_indian_phone`, `reports/models.py`, `ReportManager`, `GamificationManager`, `users/models.py`, `UserTests`, `run_report_verification_pipeline`, `reports/views.py`, `users/views.py`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Are the 23 inferred relationships involving `UserManager` (e.g. with `merge_duplicate_into_timeline()` and `GamificationManager`) actually correct?**
  _`UserManager` has 23 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@capacitor/android`, `@capacitor/app`, `@capacitor/camera` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `.upsert_user` be split into smaller, more focused modules?**
  _Cohesion score 0.12413793103448276 - nodes in this community are weakly interconnected._
- **Why does `get_collection()` connect `get_collection` to `.upsert_user`, `UserProfileSerializer`, `validate_indian_phone`, `get_db`, `services.py`, `WardTests`, `reports/models.py`, `reports/serializers.py`, `verify_location_integrity`, `GamificationManager`, `notifications/views.py`, `users/models.py`, `serialize_docs`, `UserTests`, `reports/views.py`, `users/views.py`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `UserProfileSerializer` (e.g. with `BadgeTier` and `UserRole`) actually correct?**
  _`UserProfileSerializer` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Should `validate_indian_phone` be split into smaller, more focused modules?**
  _Cohesion score 0.08735632183908046 - nodes in this community are weakly interconnected._