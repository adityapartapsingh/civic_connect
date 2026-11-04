# Graph Report - civic connect  (2026-11-04)

## Corpus Check
- 140 files · ~94,531 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 26 file(s) not represented in the graph (top: .xml 10, (none) 7, .example 2)

## Summary
- 1106 nodes · 2647 edges · 79 communities (38 shown, 41 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 131 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a57c02b9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- UserProfileSerializer
- ReportManager
- tokens.py
- UserManager
- reports/models.py
- services.py
- server.js
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
- datetime
- Key Architecture & Features
- UserRole
- duplicates.py
- fraud/views.py
- react
- useToastStore
- Civic Connect — Zero-Cost Self-Hosted WhatsApp OTP Gateway
- ReportAPITests
- logging
- GamificationManager
- OTPManager
- .upsert_user
- JWTBearerAuthentication
- detect_gibberish_or_meaningless
- reports/views.py
- django_apps
- run_report_verification_pipeline
- .upsert_user
- FraudPipelineTests
- is_mongo_connected
- users/urls.py
- ExampleInstrumentedTest.java
- analyze_report_fraud
- rest_framework
- users/views.py
- WhatsAppBridge
- main.tsx
- CivicUserPrincipal
- compute_image_phash
- validate_indian_phone
- manage.py
- merge_duplicate_into_timeline
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
- `VolunteerApplicationReviewAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `VolunteerApplicationsAdminAPIView` --uses--> `JWTBearerAuthentication`  [INFERRED]
  backend/users/views.py → backend/civic_connect/authentication.py
- `merge_duplicate_into_timeline()` --uses--> `ActionPoints`  [INFERRED]
  backend/fraud/duplicates.py → backend/gamification/models.py
- `merge_duplicate_into_timeline()` --uses--> `GamificationManager`  [INFERRED]
  backend/fraud/duplicates.py → backend/gamification/models.py

## Import Cycles
- None detected.

## Communities (79 total, 41 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.14
Nodes (17): AdminPortalPage, App(), ConfirmResolutionPage, DashboardPage, MapPage, PublicUpdatePage, RewardsPage, RouteLoadingFallback() (+9 more)

### Community 1 - "UserProfileSerializer"
Cohesion: 0.16
Nodes (5): UserProfileSerializer, AdminQuickLoginAPIView, AdminRosterAPIView, UserProfileAPIView, VolunteersListAPIView

### Community 3 - "tokens.py"
Cohesion: 0.16
Nodes (5): get_collection(), ActionTokenTests, generate_action_token(), _get_secret_key(), verify_action_token()

### Community 5 - "reports/models.py"
Cohesion: 0.12
Nodes (9): PriorityLevel, build_box_query(), build_near_query(), geojson_to_coords(), haversine_distance(), is_near_facility(), point_to_geojson(), validate_coordinates() (+1 more)

### Community 7 - "server.js"
Cohesion: 0.08
Nodes (24): cors, express, pino, qrcode, qrcode-terminal, @whiskeysockets/baileys, dependencies, cors (+16 more)

### Community 8 - "rest_framework"
Cohesion: 0.15
Nodes (7): WardManager, DepartmentSerializer, WardLeaderboardSerializer, WardSerializer, DepartmentListAPIView, WardLeaderboardAPIView, WardListAPIView

### Community 9 - "RewardsPage.tsx"
Cohesion: 0.09
Nodes (25): badgeIcons, DEFAULT_CIVIC_BADGES, CITIZEN_REWARDS_CATALOG, COMMUNITY_DISTRICT_CITIZENS, COMMUNITY_INDIA_CITIZENS, COMMUNITY_LOCAL_CITIZENS, getCitizensForState(), getOfficersForState() (+17 more)

### Community 10 - "django_apps"
Cohesion: 0.10
Nodes (8): get_db(), get_mongo_client(), get_mongo_db_name(), get_mongo_uri(), init_indexes(), _migrate_sparse_to_partial(), serialize_docs(), ReportsConfig

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 12 - "package.json"
Cohesion: 0.08
Nodes (23): name, private, type, version, autoprefixer, axios, @capacitor/android, @capacitor/app (+15 more)

### Community 13 - "notifications/views.py"
Cohesion: 0.14
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
Cohesion: 0.12
Nodes (25): StatusBadgeProps, DEFAULT_COORDS, GeolocationState, adaptBackendReportToIssue(), adaptUserProfile(), adaptWardLeaderboardItem(), backendPriorityToFrontend(), backendStatusToFrontend() (+17 more)

### Community 33 - "react"
Cohesion: 0.21
Nodes (14): CameraCapture(), CameraCaptureProps, CategoryPicker(), CategoryPickerProps, iconMap, CapturedMedia, useCamera(), ReportPage() (+6 more)

### Community 34 - "IssueMap.tsx"
Cohesion: 0.20
Nodes (16): TicketListProps, HeatmapLayer(), HeatmapLayerProps, HeatmapToggle(), HeatmapToggleProps, createCustomPin(), IssueMap(), IssueMapProps (+8 more)

### Community 35 - "authentication.py"
Cohesion: 0.10
Nodes (9): _b64url_decode(), _b64url_encode(), generate_jwt(), _get_signing_key(), IsAuthenticatedCivicUser, IsOfficerOrAdmin, IsSuperAdmin, IsWardAdminOrSuperAdmin (+1 more)

### Community 37 - "Key Architecture & Features"
Cohesion: 0.13
Nodes (14): 1. In-App Camera Only (`src/components/report/CameraCapture.tsx`), 2. Multi-Reading GPS Consistency & Mock Detection (`src/hooks/useGeolocation.ts`), 3. Hyperlocal 500m Proximity Feed & Duplicate Prevention (`src/components/report/NearbyCheck.tsx`), 4. Interactive Maps & Hotspot Heatmaps (`src/components/map/`), 5. Guaranteed Municipal SLA Countdown (`src/utils/helpers.ts`), 6. Citizen Resolution Verification (`src/pages/ConfirmResolutionPage.tsx`), 7. Token-Based One-Click Officer Dispatch (`src/pages/PublicUpdatePage.tsx`), 8. Ward Resolution Leaderboard & Gamification (`src/components/gamification/`) (+6 more)

### Community 38 - "UserRole"
Cohesion: 0.17
Nodes (5): BadgeTier, UserRole, UserSyncSerializer, validate_password_strength(), UserSyncAPIView

### Community 39 - "duplicates.py"
Cohesion: 0.18
Nodes (3): evaluate_user_badges(), ActionPoints, VolunteerScheme

### Community 40 - "fraud/views.py"
Cohesion: 0.14
Nodes (3): FraudCheckRequestSerializer, FraudCheckResponseSerializer, FraudCheckAPIView

### Community 41 - "react"
Cohesion: 0.13
Nodes (33): Button(), ButtonProps, FilterBar(), FilterBarProps, CardSkeleton(), LoadingSpinnerProps, Modal(), ModalProps (+25 more)

### Community 42 - "useToastStore"
Cohesion: 0.09
Nodes (38): Toast(), Leaderboard(), PointsBadge(), Layout(), MobileNav(), AdminPortalPage(), MUNICIPAL_WARDS, TASK_SPECIALTIES (+30 more)

### Community 43 - "Civic Connect — Zero-Cost Self-Hosted WhatsApp OTP Gateway"
Cohesion: 0.22
Nodes (8): 1. Start the Gateway, 2. Pair with Your WhatsApp Number (One-Time Setup), API Reference, Civic Connect — Zero-Cost Self-Hosted WhatsApp OTP Gateway, Django Backend Integration, Health / Status Check, Quick Start (How to Run), Send OTP

### Community 45 - "logging"
Cohesion: 0.14
Nodes (4): get_gemini_api_key(), verify_hazard_content(), VerificationResult, send_whatsapp_otp()

### Community 46 - "GamificationManager"
Cohesion: 0.13
Nodes (7): GamificationManager, BadgeSerializer, GamificationLeaderboardEntrySerializer, GamificationSummarySerializer, PointTransactionSerializer, GamificationLeaderboardAPIView, UserGamificationAPIView

### Community 49 - "JWTBearerAuthentication"
Cohesion: 0.18
Nodes (5): JWTBearerAuthentication, AdminRevokeAPIView, WhatsAppAdminResetAPIView, WhatsAppAdminStatusAPIView, WhatsAppAdminTestAPIView

### Community 50 - "detect_gibberish_or_meaningless"
Cohesion: 0.13
Nodes (5): calculate_shannon_entropy(), detect_gibberish_or_meaningless(), check_password_strength(), is_valid_indian_phone(), normalize_phone_number()

### Community 51 - "reports/views.py"
Cohesion: 0.06
Nodes (27): ReportManager, ReportStatus, EvidenceEntrySerializer, ReportConfirmSerializer, ReportCreateSerializer, ReportDetailSerializer, ReportDisputeSerializer, ReportEvidenceCreateSerializer (+19 more)

### Community 52 - "django_apps"
Cohesion: 0.12
Nodes (5): FraudConfig, GamificationConfig, NotificationsConfig, UsersConfig, WardsConfig

### Community 57 - "users/urls.py"
Cohesion: 0.20
Nodes (6): ChangePasswordAPIView, DeleteAccountAPIView, PasswordLoginAPIView, RedeemRewardAPIView, SendOTPAPIView, VerifyOTPAPIView

### Community 59 - "analyze_report_fraud"
Cohesion: 0.17
Nodes (3): verify_location_integrity(), find_duplicate_reports(), analyze_report_fraud()

### Community 61 - "rest_framework"
Cohesion: 0.12
Nodes (4): is_mock_mode(), route_category_to_department(), route_location_to_ward(), WardTests

### Community 62 - "users/views.py"
Cohesion: 0.27
Nodes (4): VolunteerApplicationSerializer, VolunteerApplicationAPIView, VolunteerApplicationReviewAPIView, VolunteerApplicationsAdminAPIView

## Knowledge Gaps
- **17 isolated node(s):** `@capacitor/android`, `@capacitor/app`, `@capacitor/camera`, `@capacitor/core`, `@capacitor/geolocation` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 513 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `get_collection()` connect `tokens.py` to `UserProfileSerializer`, `UserManager`, `reports/models.py`, `services.py`, `django_apps`, `notifications/views.py`, `datetime`, `duplicates.py`, `fraud/views.py`, `ReportAPITests`, `logging`, `GamificationManager`, `.upsert_user`, `reports/views.py`, `run_report_verification_pipeline`, `.upsert_user`, `analyze_report_fraud`, `rest_framework`, `users/views.py`, `merge_duplicate_into_timeline`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `UserManager` (e.g. with `merge_duplicate_into_timeline()` and `GamificationManager`) actually correct?**
  _`UserManager` has 19 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@capacitor/android`, `@capacitor/app`, `@capacitor/camera` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13768115942028986 - nodes in this community are weakly interconnected._
- **Why does `UserManager` connect `UserManager` to `UserProfileSerializer`, `ReportManager`, `authentication.py`, `validate_indian_phone`, `reports/models.py`, `merge_duplicate_into_timeline`, `duplicates.py`, `UserRole`, `GamificationManager`, `.upsert_user`, `JWTBearerAuthentication`, `reports/views.py`, `.upsert_user`, `users/urls.py`, `users/views.py`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `ReportManager` (e.g. with `run_report_verification_pipeline()` and `ActionTokenTests`) actually correct?**
  _`ReportManager` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Should `UserManager` be split into smaller, more focused modules?**
  _Cohesion score 0.13368983957219252 - nodes in this community are weakly interconnected._