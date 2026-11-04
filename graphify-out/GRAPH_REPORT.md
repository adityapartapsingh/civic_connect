# Graph Report - civic connect  (2026-11-04)

## Corpus Check
- 141 files · ~94,790 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 27 file(s) not represented in the graph (top: .xml 10, (none) 7, .example 3)

## Summary
- 1109 nodes · 2650 edges · 81 communities (39 shown, 42 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 131 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f0ed15ac`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- cloudinary_service.py
- ReportManager
- tokens.py
- UserManager
- reports/models.py
- typing
- server.js
- rest_framework
- RewardsPage.tsx
- get_db
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
- UserRole
- duplicates.py
- fraud/views.py
- react
- useToastStore
- Civic Connect — Zero-Cost Self-Hosted WhatsApp OTP Gateway
- ReportAPITests
- os
- GamificationManager
- OTPManager
- .upsert_user
- JWTBearerAuthentication
- detect_gibberish_or_meaningless
- reports/views.py
- reports/serializers.py
- run_report_verification_pipeline
- StatusUpdater.tsx
- FraudPipelineTests
- UserManager
- ExampleInstrumentedTest.java
- otp.py
- ErrorBoundary
- WardTests
- validators.ts
- WhatsAppBridge
- MapReportsAPIView
- CivicUserPrincipal
- ReportStatusUpdateAPIView
- IsAuthenticatedCivicUser
- manage.py
- IsOfficerOrAdmin
- IsSuperAdmin
- IsWardAdminOrSuperAdmin
- com.getcapacitor.BridgeActivity
- capacitor.config.ts

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
- `WhatsAppAdminStatusAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `WhatsAppAdminTestAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py

## Import Cycles
- None detected.

## Communities (81 total, 42 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.19
Nodes (14): AdminPortalPage, App(), ConfirmResolutionPage, DashboardPage, MapPage, PublicUpdatePage, RewardsPage, RouteLoadingFallback() (+6 more)

### Community 1 - "cloudinary_service.py"
Cohesion: 0.17
Nodes (4): configure_cloudinary(), delete_media(), is_cloudinary_configured(), upload_media()

### Community 2 - "ReportManager"
Cohesion: 0.13
Nodes (3): parse_object_id(), serialize_doc(), ReportManager

### Community 3 - "tokens.py"
Cohesion: 0.16
Nodes (6): get_collection(), ActionTokenTests, generate_action_token(), _get_secret_key(), record_token_usage(), verify_action_token()

### Community 5 - "reports/models.py"
Cohesion: 0.10
Nodes (12): is_mock_mode(), PriorityLevel, ReportStatus, build_box_query(), build_near_query(), geojson_to_coords(), haversine_distance(), is_near_facility() (+4 more)

### Community 6 - "typing"
Cohesion: 0.09
Nodes (6): verify_location_integrity(), compute_image_phash(), find_duplicate_reports(), hamming_distance(), detect_screen_recapture(), analyze_report_fraud()

### Community 7 - "server.js"
Cohesion: 0.07
Nodes (24): cors, express, pino, qrcode, qrcode-terminal, @whiskeysockets/baileys, dependencies, cors (+16 more)

### Community 8 - "rest_framework"
Cohesion: 0.15
Nodes (7): WardManager, DepartmentSerializer, WardLeaderboardSerializer, WardSerializer, DepartmentListAPIView, WardLeaderboardAPIView, WardListAPIView

### Community 9 - "RewardsPage.tsx"
Cohesion: 0.12
Nodes (17): CITIZEN_REWARDS_CATALOG, COMMUNITY_DISTRICT_CITIZENS, COMMUNITY_INDIA_CITIZENS, COMMUNITY_LOCAL_CITIZENS, getCitizensForState(), getOfficersForState(), IndianState, LeaderboardUser (+9 more)

### Community 10 - "get_db"
Cohesion: 0.06
Nodes (14): get_db(), get_mongo_client(), get_mongo_db_name(), get_mongo_uri(), init_indexes(), is_mongo_connected(), _migrate_sparse_to_partial(), HealthCheckAPIView (+6 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 12 - "package.json"
Cohesion: 0.08
Nodes (25): name, private, type, version, autoprefixer, axios, @capacitor/android, @capacitor/app (+17 more)

### Community 13 - "notifications/views.py"
Cohesion: 0.17
Nodes (4): ActionTokenResponseSerializer, PublicUpdateStatusSerializer, GenerateActionTokenAPIView, PublicUpdateAPIView

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
Cohesion: 0.50
Nodes (3): vite, vite-plugin-pwa, @vitejs/plugin-react

### Community 19 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, cap:build, cap:open, cap:run, cap:sync, dev, preview

### Community 20 - "index.ts"
Cohesion: 0.10
Nodes (31): CategoryPickerProps, iconMap, adaptBackendReportToIssue(), adaptUserProfile(), adaptWardLeaderboardItem(), backendPriorityToFrontend(), backendStatusToFrontend(), frontendPriorityToBackend() (+23 more)

### Community 33 - "react"
Cohesion: 0.19
Nodes (18): ProtectedRouteProps, Button(), ButtonProps, StatusBadge(), StatusBadgeProps, CameraCapture(), CameraCaptureProps, CategoryPicker() (+10 more)

### Community 34 - "IssueMap.tsx"
Cohesion: 0.25
Nodes (13): HeatmapLayer(), HeatmapLayerProps, HeatmapToggle(), HeatmapToggleProps, createCustomPin(), IssueMap(), IssueMapProps, RecenterMap() (+5 more)

### Community 35 - "authentication.py"
Cohesion: 0.23
Nodes (5): _b64url_decode(), _b64url_encode(), generate_jwt(), _get_signing_key(), verify_jwt()

### Community 37 - "Key Architecture & Features"
Cohesion: 0.13
Nodes (14): 1. In-App Camera Only (`src/components/report/CameraCapture.tsx`), 2. Multi-Reading GPS Consistency & Mock Detection (`src/hooks/useGeolocation.ts`), 3. Hyperlocal 500m Proximity Feed & Duplicate Prevention (`src/components/report/NearbyCheck.tsx`), 4. Interactive Maps & Hotspot Heatmaps (`src/components/map/`), 5. Guaranteed Municipal SLA Countdown (`src/utils/helpers.ts`), 6. Citizen Resolution Verification (`src/pages/ConfirmResolutionPage.tsx`), 7. Token-Based One-Click Officer Dispatch (`src/pages/PublicUpdatePage.tsx`), 8. Ward Resolution Leaderboard & Gamification (`src/components/gamification/`) (+6 more)

### Community 38 - "UserRole"
Cohesion: 0.11
Nodes (6): BadgeTier, UserProfileSerializer, UserSyncSerializer, validate_indian_phone(), validate_password_strength(), UserProfileAPIView

### Community 39 - "duplicates.py"
Cohesion: 0.11
Nodes (4): serialize_docs(), evaluate_user_badges(), ActionPoints, VolunteerScheme

### Community 40 - "fraud/views.py"
Cohesion: 0.23
Nodes (3): FraudCheckRequestSerializer, FraudCheckResponseSerializer, FraudCheckAPIView

### Community 41 - "react"
Cohesion: 0.17
Nodes (18): FilterBar(), FilterBarProps, CardSkeleton(), LoadingSpinnerProps, Pagination(), PaginationProps, TicketList(), TicketListProps (+10 more)

### Community 42 - "useToastStore"
Cohesion: 0.09
Nodes (43): Modal(), ModalProps, Toast(), Leaderboard(), PointsBadge(), Layout(), MobileNav(), AdminPortalPage() (+35 more)

### Community 43 - "Civic Connect — Zero-Cost Self-Hosted WhatsApp OTP Gateway"
Cohesion: 0.22
Nodes (8): 1. Start the Gateway, 2. Pair with Your WhatsApp Number (One-Time Setup), API Reference, Civic Connect — Zero-Cost Self-Hosted WhatsApp OTP Gateway, Django Backend Integration, Health / Status Check, Quick Start (How to Run), Send OTP

### Community 45 - "os"
Cohesion: 0.11
Nodes (3): get_gemini_api_key(), verify_hazard_content(), send_whatsapp_otp()

### Community 46 - "GamificationManager"
Cohesion: 0.10
Nodes (8): GamificationManager, BadgeSerializer, GamificationLeaderboardEntrySerializer, GamificationSummarySerializer, PointTransactionSerializer, GamificationTests, GamificationLeaderboardAPIView, UserGamificationAPIView

### Community 49 - "JWTBearerAuthentication"
Cohesion: 0.14
Nodes (4): JWTBearerAuthentication, VolunteerApplicationSerializer, VolunteerApplicationsAdminAPIView, WhatsAppAdminResetAPIView

### Community 51 - "reports/views.py"
Cohesion: 0.12
Nodes (14): ReportConfirmSerializer, ReportDetailSerializer, ReportDisputeSerializer, ReportEvidenceCreateSerializer, ReportUpvoteCreateSerializer, FeedReportsAPIView, NearbyReportsAPIView, ReportConfirmAPIView (+6 more)

### Community 52 - "reports/serializers.py"
Cohesion: 0.16
Nodes (6): EvidenceEntrySerializer, ReportCreateSerializer, StatusHistoryEntrySerializer, check_password_strength(), is_valid_indian_phone(), normalize_phone_number()

### Community 53 - "run_report_verification_pipeline"
Cohesion: 0.13
Nodes (5): find_nearby_active_duplicate(), merge_duplicate_into_timeline(), run_report_verification_pipeline(), VerificationResult, calculate_priority_score()

### Community 54 - "StatusUpdater.tsx"
Cohesion: 0.26
Nodes (9): PhotoGeoTag, StatusUpdater(), StatusUpdaterProps, DEFAULT_COORDS, GeolocationState, useGeolocation(), PublicUpdatePage(), StatusUpdatePayload (+1 more)

### Community 57 - "UserManager"
Cohesion: 0.12
Nodes (18): UserManager, UserRole, AdminProvisionAPIView, AdminQuickLoginAPIView, AdminRevokeAPIView, AdminRosterAPIView, ChangePasswordAPIView, DeleteAccountAPIView (+10 more)

### Community 62 - "validators.ts"
Cohesion: 0.40
Nodes (3): COMMON_WEAK_PASSWORDS, PasswordStrengthResult, PhoneValidationResult

## Knowledge Gaps
- **17 isolated node(s):** `@capacitor/android`, `@capacitor/app`, `@capacitor/camera`, `@capacitor/core`, `@capacitor/geolocation` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 515 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **42 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `get_collection()` connect `tokens.py` to `ReportManager`, `UserManager`, `reports/models.py`, `typing`, `duplicates.py`, `datetime`, `get_db`, `ReportAPITests`, `notifications/views.py`, `GamificationManager`, `.upsert_user`, `JWTBearerAuthentication`, `reports/views.py`, `run_report_verification_pipeline`, `notifications/views.py`, `UserManager`, `otp.py`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `UserManager` (e.g. with `merge_duplicate_into_timeline()` and `GamificationManager`) actually correct?**
  _`UserManager` has 19 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@capacitor/android`, `@capacitor/app`, `@capacitor/camera` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ReportManager` be split into smaller, more focused modules?**
  _Cohesion score 0.1265597147950089 - nodes in this community are weakly interconnected._
- **Why does `UserManager` connect `UserManager` to `ReportManager`, `authentication.py`, `UserManager`, `reports/models.py`, `UserRole`, `duplicates.py`, `GamificationManager`, `.upsert_user`, `JWTBearerAuthentication`, `run_report_verification_pipeline`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `ReportManager` (e.g. with `run_report_verification_pipeline()` and `ActionTokenTests`) actually correct?**
  _`ReportManager` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Should `UserManager` be split into smaller, more focused modules?**
  _Cohesion score 0.10810810810810811 - nodes in this community are weakly interconnected._